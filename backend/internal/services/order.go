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

	cartWithItems, err := s.cartRepository.GetCartWithItems(cart.ID)
	if err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}
	cart = cartWithItems

	tx := s.cartRepository.Begin()

	var totalPrice float64
	for _, item := range cart.Items {
		totalPrice += item.Snack.Price * float64(item.Quantity)

		if err := tx.Model(&models.Snack{}).
			Where("id = ?", item.SnackID).
			Update("quantity", tx.Raw("quantity - ?", item.Quantity)).
			Error; err != nil {
			tx.Rollback()
			return models.Order{}, http.StatusInternalServerError, err
		}
	}

	if err := tx.Model(&models.Cart{}).Where("id = ?", cart.ID).Update("status", "ordered").Error; err != nil {
		tx.Rollback()
		return models.Order{}, http.StatusInternalServerError, err
	}

	order.CartID = cart.ID
	order.TrackingID = uuid.New().String()
	order.TotalPrice = totalPrice
	order.Status = "pending"

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return models.Order{}, http.StatusInternalServerError, err
	}

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

	if err := tx.Commit().Error; err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}

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

func (s *OrderServiceImpl) UpdateOrderStatus(order models.Order, userContext models.UserContext) (models.Order, int, error) {
	order.Status = "delivered"

	if err := s.orderRepository.Update(&order); err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}

	return order, http.StatusOK, nil
}

func (s *OrderServiceImpl) GetOrder(order models.Order, userContext models.UserContext) (models.Order, int, error) {
	order, err := s.orderRepository.GetOrder(order)
	if err != nil {
		return models.Order{}, http.StatusInternalServerError, err
	}

	return order, http.StatusOK, nil
}
