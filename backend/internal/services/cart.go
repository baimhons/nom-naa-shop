package services

import (
	"errors"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CartService interface {
	AddItemToCart(req request.AddItemToCartRequest, userContext models.UserContext) (*models.Cart, int, error)
	GetCartByID(id uuid.UUID) (*models.Cart, int, error)
	UpdateItemFromCart(req request.UpdateItemFromCartRequest, userContext models.UserContext) (*models.Cart, int, error)
	DeleteItemFromCart(itemID uuid.UUID, userContext models.UserContext) (*models.Cart, int, error)
}

type CartServiceImpl struct {
	cartRepository  repositories.CartRepository
	snackRepository repositories.SnackRepository
	itemRepository  repositories.ItemRepository
}

func NewCartService(cartRepository repositories.CartRepository, snackRepository repositories.SnackRepository, itemRepository repositories.ItemRepository) *CartServiceImpl {
	return &CartServiceImpl{
		cartRepository:  cartRepository,
		snackRepository: snackRepository,
		itemRepository:  itemRepository,
	}
}

func (s *CartServiceImpl) AddItemToCart(req request.AddItemToCartRequest, userContext models.UserContext) (*models.Cart, int, error) {
	cart, err := s.cartRepository.GetCartByCondition("user_id = ? AND status = ?", userContext.ID, "pending")
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("cart not found")
	}

	snack, err := s.snackRepository.GetSnackByID(req.SnackID)
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("snack not found")
	}

	if snack.Quantity < req.Quantity {
		return nil, fiber.StatusBadRequest, errors.New("stock not enough")
	}

	tx := s.cartRepository.Begin()

	if len(cart.Items) == 0 {
		if err := tx.Create(&models.Item{
			SnackID:  req.SnackID,
			Quantity: req.Quantity,
			CartID:   cart.ID,
		}).Error; err != nil {
			tx.Rollback()
			return nil, fiber.StatusInternalServerError, errors.New("failed to create item: " + err.Error())
		}

		cart.Items = append(cart.Items, models.Item{
			SnackID:  req.SnackID,
			Quantity: req.Quantity,
			CartID:   cart.ID,
		})
	}

	for _, cartItem := range cart.Items {
		if cartItem.SnackID == req.SnackID {
			cartItem.Quantity += req.Quantity
			itemForUpdate := models.Item{}
			if err := tx.First(&itemForUpdate, "id = ?", cartItem.ID).Error; err != nil {
				tx.Rollback()
				return nil, fiber.StatusInternalServerError, errors.New("failed to get item: " + err.Error())
			}

			itemForUpdate.Quantity = cartItem.Quantity
			if err := tx.Updates(&itemForUpdate).Error; err != nil {
				tx.Rollback()
				return nil, fiber.StatusInternalServerError, errors.New("failed to update item: " + err.Error())
			}
		} else {
			if err := tx.Create(&models.Item{
				SnackID:  req.SnackID,
				Quantity: req.Quantity,
				CartID:   cart.ID,
			}).Error; err != nil {
				tx.Rollback()
				return nil, fiber.StatusInternalServerError, errors.New("failed to create item: " + err.Error())
			}

			cart.Items = append(cart.Items, models.Item{
				SnackID:  req.SnackID,
				Quantity: req.Quantity,
				CartID:   cart.ID,
			})
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("failed to commit transaction: " + err.Error())
	}

	return cart, fiber.StatusOK, nil
}

func (s *CartServiceImpl) GetCartByID(id uuid.UUID) (*models.Cart, int, error) {
	cart, err := s.cartRepository.GetCartByCondition("user_id = ? AND status = ?", id, "pending")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.StatusNotFound, errors.New("cart not found")
		}
		return nil, fiber.StatusInternalServerError, err
	}

	for i := range cart.Items {
		snack, err := s.snackRepository.GetSnackByID(cart.Items[i].SnackID)
		if err != nil {
			return nil, fiber.StatusInternalServerError, err
		}
		cart.Items[i].Snack = *snack
	}

	return cart, fiber.StatusOK, nil
}

func (s *CartServiceImpl) UpdateItemFromCart(req request.UpdateItemFromCartRequest, userContext models.UserContext) (*models.Cart, int, error) {
	cart, err := s.cartRepository.GetCartByCondition("user_id = ? AND status = ?", userContext.ID, "pending")
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("cart not found")
	}

	item, err := s.itemRepository.GetItemByID(req.ItemID)
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("item not found")
	}

	snack, err := s.snackRepository.GetSnackByID(item.SnackID)
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("snack not found")
	}

	if snack.Quantity < req.Quantity {
		return nil, fiber.StatusBadRequest, errors.New("stock not enough")
	}

	item.Quantity = req.Quantity
	if err := s.itemRepository.Update(item); err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("failed to update item: " + err.Error())
	}

	updatedCart, err := s.cartRepository.GetCartByID(cart.ID)
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("failed to fetch updated cart: " + err.Error())
	}

	return updatedCart, fiber.StatusOK, nil
}

func (s *CartServiceImpl) DeleteItemFromCart(itemID uuid.UUID, userContext models.UserContext) (*models.Cart, int, error) {
	cart, err := s.cartRepository.GetCartByCondition("user_id = ? AND status = ?", userContext.ID, "pending")
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("cart not found")
	}

	item, err := s.itemRepository.GetItemByCondition("id = ?", itemID)
	if err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("item not found")
	}

	if err := s.itemRepository.Delete(item); err != nil {
		return nil, fiber.StatusInternalServerError, errors.New("failed to delete item: " + err.Error())
	}

	return cart, fiber.StatusOK, nil
}
