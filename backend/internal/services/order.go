package services

import (
	"errors"
	"net/http"

	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/google/uuid"
)

type OrderService interface {
	ConfirmOrder(order models.Order, userContext models.UserContext) (models.Order, int, error)
}

type OrderServiceImpl struct {
	orderRepository repositories.OrderRepository
	cartRepository  repositories.CartRepository
}

func NewOrderService(orderRepository repositories.OrderRepository, cartRepository repositories.CartRepository) OrderService {
	return &OrderServiceImpl{
		orderRepository: orderRepository,
		cartRepository:  cartRepository,
	}
}

func (s *OrderServiceImpl) ConfirmOrder(order models.Order, userContext models.UserContext) (models.Order, int, error) {
	// Get cart with items and their associated snacks
	cart, err := s.cartRepository.GetCartByCondition("id = ? AND status = ?", order.CartID, "confirmed")
	if err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}

	if cart == nil || cart.ID == uuid.Nil {
		return models.Order{}, http.StatusBadRequest, errors.New("cart not found")
	}

	if cart.Status != "confirmed" {
		return models.Order{}, http.StatusBadRequest, errors.New("cart is not confirmed")
	}

	// Load cart items and snacks properly
	// Using the repository's method instead of direct DB access to ensure proper preloading
	cartWithItems, err := s.cartRepository.GetCartWithItems(cart.ID)
	if err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}
	cart = cartWithItems

	// Start transaction
	tx := s.cartRepository.Begin()

	// Calculate total price from cart items
	var totalPrice float64
	for _, item := range cart.Items {
		totalPrice += item.Snack.Price * float64(item.Quantity)

		// Update snack inventory by reducing the quantity
		if err := tx.Model(&models.Snack{}).
			Where("id = ?", item.SnackID).
			Update("quantity", tx.Raw("quantity - ?", item.Quantity)).
			Error; err != nil {
			tx.Rollback()
			return models.Order{}, http.StatusInternalServerError, err
		}
	}

	// Update cart status to "ordered" - only update the status field
	// to avoid overwriting the relationships
	if err := tx.Model(&models.Cart{}).Where("id = ?", cart.ID).Update("status", "ordered").Error; err != nil {
		tx.Rollback()
		return models.Order{}, http.StatusInternalServerError, err
	}

	// Create new order - only store references, not creating new items
	order.CartID = cart.ID
	order.TrackingID = uuid.New().String()
	order.TotalPrice = totalPrice
	order.Status = "pending"

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return models.Order{}, http.StatusInternalServerError, err
	}

	// Create new empty cart for user
	userUUID, err := uuid.Parse(userContext.ID)
	if err != nil {
		tx.Rollback()
		return models.Order{}, http.StatusInternalServerError, err
	}

	if err := tx.Create(&models.Cart{
		UserID: userUUID,
		Status: "pending",
	}).Error; err != nil {
		tx.Rollback()
		return models.Order{}, http.StatusInternalServerError, err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}

	// Load relationships for response using a proper preloading strategy
	var finalOrder models.Order
	if err := s.orderRepository.GetDB().
		Preload("Cart").
		Preload("Cart.Items").
		Preload("Cart.Items.Snack").
		Preload("Cart.User").
		Preload("Address").
		First(&finalOrder, order.ID).Error; err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}

	return finalOrder, http.StatusOK, nil
}
