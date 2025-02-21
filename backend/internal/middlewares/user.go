package middlewares

import (
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/gofiber/fiber/v2"
)

type UserMiddleware struct {
}

func NewUserMiddleware() *UserMiddleware {
	return &UserMiddleware{}
}

func (u *UserMiddleware) GetAllUsers(c *fiber.Ctx) error {

	userContext, ok := c.Locals("user").(models.UserContext)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}

	if userContext.Role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "Forbidden",
		})
	}
	return c.Next()
}

func (u *UserMiddleware) GetUserProfile(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}

	if user.ID.String() != c.Params("id") {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "Forbidden",
		})
	}

	return c.Next()
}
