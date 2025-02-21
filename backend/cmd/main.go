package main

import (
	"github.com/baimhons/nom-naa-shop.git/internal/initial"
)

func main() {
	app := initial.InitializeApp()

	app.SetUpMiddlewares()

	app.SetUpRoutes()

	app.Run()
}
