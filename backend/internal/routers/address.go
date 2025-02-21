package routers

import (
	"github.com/baimhons/nom-naa-shop.git/internal/handlers"
	"github.com/baimhons/nom-naa-shop.git/internal/validations"
	"github.com/gofiber/fiber/v2"
)

type AddressRouter struct {
	app            fiber.Router
	addressHandler *handlers.AddressHandler
}

func NewAddressRouter(app fiber.Router, addressHandler *handlers.AddressHandler) *AddressRouter {
	return &AddressRouter{app: app, addressHandler: addressHandler}
}

func (r *AddressRouter) SetupRoutes() {
	address := r.app.Group("/address")
	address.Post("/", validations.NewAddressValidate().ValidateCreateAddressRequest, r.addressHandler.CreateAddress)
	address.Get("/province/:province_id", r.addressHandler.GetProvince)
	address.Get("/district/:district_id", r.addressHandler.GetDistrict)
	address.Get("/sub_district/:sub_district_id", r.addressHandler.GetSubDistrict)
	address.Get("/province/:province_id/districts", r.addressHandler.GetAllDistrictsByProvinceID)
	address.Get("/district/:district_id/sub_districts", r.addressHandler.GetAllSubDistrictsByDistrictID)
}
