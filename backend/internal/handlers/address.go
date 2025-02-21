package handlers

import (
	"log"
	"strconv"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/services"
	"github.com/gofiber/fiber/v2"
)

type AddressHandler struct {
	addressService services.AddressService
}

func NewAddressHandler(addressService services.AddressService) *AddressHandler {
	return &AddressHandler{addressService: addressService}
}

func (h *AddressHandler) GetProvince(c *fiber.Ctx) error {
	provinceID := c.Params("province_id")
	// Convert string ID to int since GetProvinceByID expects an int
	provinceIDInt, err := strconv.Atoi(provinceID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid province ID",
		})
	}
	province, err := h.addressService.GetProvinceByID(provinceIDInt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: "Failed to get province",
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Message: "Province fetched successfully",
		Data:    province,
	})
}

func (h *AddressHandler) GetDistrict(c *fiber.Ctx) error {
	districtID := c.Params("district_id")
	// Convert string ID to int since GetDistrictByID expects an int
	districtIDInt, err := strconv.Atoi(districtID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid district ID",
		})
	}
	district, err := h.addressService.GetDistrictByID(districtIDInt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: "Failed to get district",
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Message: "District fetched successfully",
		Data:    district,
	})
}

func (h *AddressHandler) GetSubDistrict(c *fiber.Ctx) error {
	subDistrictID := c.Params("sub_district_id")
	// Convert string ID to int since GetSubDistrictByID expects an int
	subDistrictIDInt, err := strconv.Atoi(subDistrictID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid sub district ID",
		})
	}
	subDistrict, err := h.addressService.GetSubDistrictByID(subDistrictIDInt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: "Failed to get sub district",
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Message: "Sub district fetched successfully",
		Data:    subDistrict,
	})
}

func (h *AddressHandler) CreateAddress(c *fiber.Ctx) error {
	req, ok := c.Locals("req").(request.CreateAddressRequest)

	if !ok {
		log.Println("Failed to parse request:", c.Locals("req"))
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid request",
		})
	}

	address, err := h.addressService.CreateAddress(req)
	if err != nil {
		log.Println("Error creating address:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: "Failed to create address",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(response.SuccessResponse{
		Message: "Address created successfully",
		Data:    address,
	})
}

func (h *AddressHandler) GetAllDistrictsByProvinceID(c *fiber.Ctx) error {
	provinceID := c.Params("province_id")
	provinceIDInt, err := strconv.Atoi(provinceID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid province ID",
		})
	}

	districts, err := h.addressService.GetAllDistrictsByProvinceID(provinceIDInt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: "Failed to get districts",
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Message: "Districts fetched successfully",
		Data:    districts,
	})
}

func (h *AddressHandler) GetAllSubDistrictsByDistrictID(c *fiber.Ctx) error {
	districtID := c.Params("district_id")
	districtIDInt, err := strconv.Atoi(districtID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid district ID",
		})
	}

	subDistricts, err := h.addressService.GetAllSubDistrictsByDistrictID(districtIDInt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: "Failed to get sub districts",
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Message: "Sub districts fetched successfully",
		Data:    subDistricts,
	})
}
