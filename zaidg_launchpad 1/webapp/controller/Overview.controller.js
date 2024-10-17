sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"com/airdit/qudg/qudglpad/model/formatter",
	"sap/m/Dialog",
	"sap/m/StandardListItem",
	"sap/m/List",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	'sap/ui/core/Fragment',
	"sap/ui/core/ws/WebSocket",
	"sap/ui/core/library",
	"sap/ui/core/Theming",
	'sap/ui/model/BindingMode',
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format'

], function (Controller, Filter, FilterOperator, JSONModel, formatter, Dialog, StandardListItem, List, Button, OverflowToolbar,
	ToolbarSpacer,
	MessageToast, MessageBox, Fragment, WebSocket, coreLibrary, Theming, BindingMode, FlattenedDataset, ChartFormatter, Format) {
	"use strict";
	// var priority = coreLibrary.Priority;
	var Priority = coreLibrary.Priority;
	var Priority = {
		VeryHigh: 'Very High',
		High: 'High',
		Medium: 'Medium',
		Low: 'Low'
	};

	var PriorityOrder = {
		'Very High': 1,
		'High': 2,
		'Medium': 3,
		'Low': 4
	};

	function sortByPriority(data) {
		return data.sort(function (a, b) {
			var aPriority = PriorityOrder[a.priokx] || PriorityOrder[Priority.Medium];
			var bPriority = PriorityOrder[b.priokx] || PriorityOrder[Priority.Medium];
			return aPriority - bPriority;
		});
	}
	return Controller.extend("com.airdit.qudg.qudglpad.controller.Overview", {
		formatter: formatter,
		websocket: null,
		settingsModel: {
			dataset: {
				name: "Dataset",
				defaultSelected: 1,
				values: [{
					name: "Small",
					value: "/small.json"
				}, {
					name: "Medium",
					value: "/medium.json"
				}]
			},
			series: {
				name: "Series",
				defaultSelected: 0,
				enabled: false,
				values: [{
					name: "1 Series"
				}, {
					name: '2 Series'
				}]
			},
			dataLabel: {
				name: "Value Label",
				defaultState: false
			},
			axisTitle: {
				name: "Axis Title",
				defaultState: false,
				enabled: false
			}
		},

		checkThemeAndApplyImage: function () {
			let elem = document.querySelector('.sapTntToolHeader');
			let style = window.getComputedStyle(elem);
			let data = {
				"imageName": ""
			};
			if (style.backgroundColor === 'rgb(255, 255, 255)') {
				data.imageName = "Logo.png";
			} else {
				data.imageName = "LogoB.png";
			}
			this.getView().setModel(new JSONModel(data), "iconMdl");

		},
		createLeftContent: function (sObj) {
			this.createContent('com.qudgovp', 'Dashboard'); //DASHBOARD PAGE
			for (var i = 0; i < sObj.length; i++) {

				for (var j = 0; j < sObj[i].tiles.length; j++) {

					this.createContent(sObj[i].tiles[j].ui5_component, sObj[i].tiles[j].display_title_text);

				}

			}


		},
		navigationData: [],
		createdData: [],

		componentCreated: function (oEvent) {
			var routes = oEvent.getParameter("component").getManifest()['sap.ui5'].routing.routes;
			for (var count = 0; count < routes.length; count++) {
				//	routes[count].target = [];
				//this.getOwnerComponent().getRouter().addRoute(routes[count]);
			}
			debugger;
			if (routes.length !== 0) {
				var cont = oEvent.getParameter("component").oContainer.getProperty("name");
				let nav = {};
				nav.appid = cont;
				nav.navid = routes[0].name;
				this.navigationData.push(nav);
			}

		},
		createContent: function (key, text) {
			debugger;

			var content = new sap.ui.core.ComponentContainer({
				name: key,
				async: true,
				lifecycle: sap.ui.core.ComponentLifecycle.Container,
				propagateModel: true,
				height: "100%",
				width:"100%"
			});
			content.attachComponentCreated(this.componentCreated, this);
			// page.addContent(content);
			let page = new sap.m.Page(key, {
				title: text,
				titleAlignment: sap.m.TitleAlignment.Center,
				content: [content],
			});
			page.addEventDelegate({
				onAfterRendering: function (evt) {
					//alert("hi");
				}.bind(this)
			});
			page.attachBrowserEvent('DOMContentLoaded', function () {
				debugger;
				//alert("Image loaded");
			});
			// scroll.attachEvent("beforeShow", null, this.onBeforeShow, this);
			page.addEventDelegate({
				onAfterShow: function (evt) {
					sap.ui.core.BusyIndicator.hide();
					if (!evt.data) {
						var appid = "";
						var navid = "";
						let pageid = evt.toId;
						for (var k = 0; k < this.navigationData.length; k++) {
							if (this.navigationData[k].appid === pageid) {
								appid = this.navigationData[k].appid;
								navid = this.navigationData[k].navid;
							}
						}
						//this.getOwnerComponent().getRouter().navTo(navid);

					} else {
						var appid = "";
						var navid = "";
						let pageid = evt.toId;
						for (var k = 0; k < this.navigationData.length; k++) {
							if (this.navigationData[k].appid === pageid) {
								appid = this.navigationData[k].appid;
								navid = this.navigationData[k].navid;
							}
						}

						//this.getOwnerComponent().getRouter().navTo(navid, evt.data);
					}
					debugger;
					// alert("hi");
				}.bind(this)
			});

			this.getView().byId("pageContainer").addPage(page);

		},
		dupHash: function (o) {
			return o.url;
		},
		readLandingPageContent: function () {
			//sap.ui.core.BusyIndicator.show();
			//this.getView().byId("sideNavigation").setBusy(true);$filter=Launchpadtype eq '01'
			let filters = [];
			filters.push(new Filter("Launchpadtype", FilterOperator.EQ, "01"));
			this.getOwnerComponent().getModel().read("/ZC_QU_DG_CATALOG_CONFIG", {
				// filters: filters,
				success: function (oData, oReponse) {
					//sap.ui.core.BusyIndicator.hide();
					let leftPageData = [];

					let dupData = oReponse.data.results;

					var hashesFound = {};

					oReponse.data.results.forEach(function (o) {
						hashesFound[this.dupHash(o)] = o;
					}.bind(this))

					var results = Object.keys(hashesFound).map(function (k) {
						return hashesFound[k];
					});

					for (let i = 0; i < results.length; i++) {
						let catName = results[i].url;
						// if (catName === "X-SAP-UI2-CATALOGPAGE:zqudg_rules" || catName === "X-SAP-UI2-CATALOGPAGE:ZQUDG_MAT_REQ" || catName ===
						// 	"X-SAP-UI2-CATALOGPAGE:ZQUDG_BOM") {
						let catObjects = {
							"CatId": catName,
							"ui5_component": "",
							"Appname": "",
							"Catdesc": results[i].catDesc,
							"icon": results[i].icon,
							"tiles": []
						}
						for (let j = 0; j < dupData.length; j++) {
							if (catName === dupData[j].url) {
								let jsonObj = JSON.parse(dupData[j].config);
								let tileConfig = JSON.parse(jsonObj.tileConfiguration);
								catObjects.tiles.push(tileConfig);

							}

						}
						leftPageData.push(catObjects);
						leftPageData.forEach(item => {
							let uniqueTiles = new Set();
							let filteredTiles = [];

							item.tiles.forEach(tile => {
								if (!uniqueTiles.has(tile.semantic_object)) {
									uniqueTiles.add(tile.semantic_object);
									filteredTiles.push(tile);
								}
							});

							item.tiles = filteredTiles;
						});
						// }

						// this.readiconInfo(catObjects);
						//leftPageData.push(this.readiconInfo(catObjects)); 

					}
					debugger
					this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(leftPageData), "DashBoardInitial");
					this.registerModuleAndAddRoutes(leftPageData);
					this.createLeftContent(leftPageData);


					//Navigate to Home Page
					//this.getView().byId("pageContainer").to('com.qudgovp');
					//this.createContent("zruleconfig.qudg");

					// let qudgCatalog = [];
					// for (let i = 0; i < results.length; i++) {
					// 	if (results[i].url === "X-SAP-UI2-CATALOGPAGE:zqudg_rules") {
					// 		let catObjects = {
					// 			"CatId": results[i].AgrName,
					// 			"Catdesc": results[i].CatDesc,
					// 			"icon": results[i].icon,
					// 			"tiles": []
					// 		}
					// 		let jsonObj = JSON.parse(results[i].config);
					// 		let tileConfig = JSON.parse(jsonObj.tileConfiguration);
					// 		catObjects.tiles.push(tileConfig);
					// 		qudgCatalog.push(catObjects);
					// 	}

					// }

					// let leftPageDataCal = leftPageData;

					// for (let k = 0; k < leftPageData.length; k++) {
					// 	// let catName = results[i].url;
					// 	// let catObjects = {"CatId":catName,"Catdesc":results[i].CatDesc,"tiles":[]}
					// 	for (let l = 0; l < leftPageData.tiles.length; l++) {
					// 		if(catName === dupData[j].url){
					// 			let jsonObj = JSON.parse(dupData[j].config);
					// 			let tileConfig = JSON.parse(jsonObj.tileConfiguration);
					// 			catObjects.tiles.push(tileConfig);

					// 		}

					// 	}
					// 	leftPageData.push(catObjects);

					// }

					debugger;
					//var data = JSON.parse(oReponse.data.results[0].Data);
					// this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(data), "DashBoardInitial");
					// this.getView().byId("sideNavigation").setBusy(false);
					// this.sideData = data;
					// this.registerModuleAndAddRoutes(JSON.parse(oReponse.data.results[0].Data));
					// let Homepage = data.NAMESPACE;
					// let otherPages
					// for (var i = 1; i < data.NAVIGATION.length; i++) {

					// 	if (Homepage === data.NAVIGATION[i].NAMESPACE) {
					// 		data.NAVIGATION.slice(i, 1);
					// 	}

					// }
					// this.createContent(Homepage);
					// this.createLeftContent(data);

					// var router = this.getOwnerComponent().getRouter();
					// var hashchanger = router.getHashChanger();
					//this.checkThemeAndApplyImage();
					//this.themeOnload();

				}.bind(this),
				error: function (error) {

					sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			});
		},
		sideData: null,
		//For left side app module registration
		registerModuleAndAddRoutes: function (sObj) {
			var modules = [];
			var routs = [];
			var registerObjects = {};

			for (var i = 0; i < sObj.length; i++) {

				for (var j = 0; j < sObj[i].tiles.length; j++) {
					let moduleObjects = {};

					let routeObjects = {};

					moduleObjects.Name = sObj[i].tiles[j].ui5_component.replaceAll(".", "/");
					moduleObjects.Path = sObj[i].tiles[j].url;
					modules.push(moduleObjects);

				}
			}

			modules.push({ Name: 'com/qudgovp', Path: '/sap/bc/ui5_ui5/sap/ZAIDGMMOVP' })

			// Create Routing & Register Modules
			var stringModule = "";
			for (var k = 0; k < modules.length; k++) {

				registerObjects[modules[k].Name] = modules[k].Path;

			};

			sap.ui.loader.config({
				paths: registerObjects
			});

		},
		afterRendering: function (oevent) {
			sap.ui.core.BusyIndicator.hide();
		},
		onBeforeShow: function (oEvent) {
			debugger;
		},
		onPageNavigationFinished: function (oEvent) {
			debugger;
			sap.ui.core.BusyIndicator.hide();
		},
		onafterNavigate: function (oEvent) {
			// debugger;
			// var appid = "";
			// var navid = "";
			// let pageid = oEvent.getParameter("toId");
			// for (var k = 0; k < this.navigationData.length; k++) {
			// 	if (this.navigationData[k].appid === pageid) {
			// 		appid = this.navigationData[k].appid;
			// 		navid = this.navigationData[k].navid;
			// 	}
			// }
			// this.getOwnerComponent().getRouter().navTo(navid);
		},
		onnavigate: function (oEvent) {
			debugger;
			// sap.ui.core.BusyIndicator.show();
			//this.getView().byId("pageContainer").setBusy(true);
		},
		themeOnload: function () {
			Theming.attachApplied(function (oevt) {
				let elem = document.querySelector('.sapTntToolHeader');
				let style = window.getComputedStyle(elem);
				let data = {
					"imageName": ""
				};
				if (style.backgroundColor === 'rgb(255, 255, 255)') {
					data.imageName = "Logo.png";
				} else {
					data.imageName = "LogoB.png";
				}
				this.getView().setModel(new JSONModel(data), "iconMdl");
			}.bind(this));
		},
		recentVisitsData: [],
		formatSapDate: function (dateString) {
			var date = new Date(dateString);
			var options = {
				weekday: 'short',
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: true
			};
			return date.toLocaleString('en-US', options);
		},
		onInit: function () {
			this._fetchWorkflowItems();
			var oJSONModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJSONModel, "recentVisitsModel");
			this._fetchData();
			var oModel = new JSONModel(this.settingsModel);
			// oModel.setDefaultBindingMode(BindingMode.OneWay);
			this.getView().setModel(oModel);
			Theming.setTheme("sap_horizon");
			// jQuery.sap.registerModulePath("znotidisplay", "/sap/bc/ui5_ui5/sap/znotidisplay");
			// sap.ui.getCore().moveToApp = this.createContentFromOutside;
			// sap.ui.getCore().rootview = this.getView();
			// sap.ui.getCore().moveToNewApp = function (key, bspAppName) {
			// 	if (!sap.ui.getCore().byId(key)) {

			// 		var content = new sap.ui.core.ComponentContainer({
			// 			name: key,
			// 			// async: true,
			// 			lifecycle: sap.ui.core.ComponentLifecycle.Application,
			// 			propagateModel: true
			// 		});

			// 		var scroll = new sap.m.ScrollContainer(key, {
			// 			horizontal: false,
			// 			vertical: true,
			// 			height: "100%"
			// 		});

			// 		scroll.addEventDelegate({
			// 			onAfterShow: function (evt) {
			// 				if (!evt.data) {
			// 					var appid = "";
			// 					var navid = "";
			// 					let pageid = evt.toId;
			// 					for (var k = 0; k < this.navigationData.length; k++) {
			// 						if (this.navigationData[k].appid === pageid) {
			// 							appid = this.navigationData[k].appid;
			// 							navid = this.navigationData[k].navid;
			// 						}
			// 					}
			// 					this.getOwnerComponent().getRouter().navTo(navid);

			// 				} else {
			// 					var appid = "";
			// 					var navid = "";
			// 					let pageid = evt.toId;
			// 					for (var k = 0; k < this.navigationData.length; k++) {
			// 						if (this.navigationData[k].appid === pageid) {
			// 							appid = this.navigationData[k].appid;
			// 							navid = this.navigationData[k].navid;
			// 						}
			// 					}

			// 					this.getOwnerComponent().getRouter().navTo(navid, evt.data);
			// 				}
			// 				debugger;
			// 				// alert("hi");
			// 			}.bind(this)
			// 		});

			// 		content.attachComponentCreated(this.componentCreated, this);
			// 		scroll.addContent(content);
			// 		sap.ui.getCore().dalmianav.addPage(scroll);

			// 		let registerObjects = {};
			// 		let urlPath = "/sap/bc/ui5_ui5/sap/";
			// 		let bspPath = urlPath + bspAppName.toLowerCase();
			// 		let modulePath = key.replaceAll(".", "/");
			// 		registerObjects[modulePath] = bspPath;
			// 		sap.ui.loader.config({
			// 			paths: registerObjects
			// 		});

			// 	}
			// }.bind(this);

			this.getView().setModel(this.getOwnerComponent().getModel("THEMEDATA"), "THEMES");
			//this.setThemeBaesdOnTime();

			// this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onObjectMatched,
			// 	this);
			// debugger;
			this.websocket = new WebSocket("/sap/bc/apc/sap/zqudg_apc?sap-client=200");
			this.websocket.attachOpen(null, this.websocketonOpen, this)
			this.websocket.attachMessage(null, this.websocketonMessage, this);
			this.oModel = this.getOwnerComponent().getModel();

			// this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({}), "SubscriptionModel");
			this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({}), "PushNotificationModel");
			this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({}), "Notificationcount");
			// this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({}), "FavSettings");
			this.getView().setModel(this.getOwnerComponent().getModel("SETDATA"), "SETTINGDATA");

			this.userName = "";

			this.readLandingPageContent();

			this.pushnotificationcount();
			// sap.ui.getCore().dalmianav = this.byId("pageContainer");
			this.graphTest();

		},
		vizframe: null,
		_fetchData: function () {
			var sUrl = "/sap/opu/odata/sap/ZC_QUDG_DEADLINE_MONITOR_CDS";
			var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
			var that = this;

			sap.ui.core.BusyIndicator.show();

			// Fetch data for line chart
			oModel.read("/ZC_QUDG_DEADLINE_MONITOR", {
				urlParameters: {
					"$select": "PENDING_DAYS,instid",
					"$top": 5,
					"$orderby": "PENDING_DAYS desc"
				},
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					var oJSONModel = new JSONModel(oData.results);
					that.getView().setModel(oJSONModel, "lineChart");
					that._initializeVizFrame("idVizFrame3", "lineChart", true);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					console.error("Error fetching data for line chart", oError);
				}
			});

			// Fetch data for donut chart
			oModel.read("/ZC_QUDG_DEADLINE_MONITOR", {
				urlParameters: {
					"$top": 25
				},
				success: function (oData) {
					var materialCounts = {};
					oData.results.forEach(function (data) {
						if (materialCounts[data.MatReqId]) {
							materialCounts[data.MatReqId]++;
						} else {
							materialCounts[data.MatReqId] = 1;
						}
					});

					var processedData = Object.keys(materialCounts).map(function (key) {
						return {
							material: key,
							count: materialCounts[key]
						};
					});

					var oJSONModel = new JSONModel({
						materials: processedData
					});
					that.getView().setModel(oJSONModel, "materialCounts");
					that._initializeVizFrame("idVizFrame", "materialCounts", false);
				},
				error: function (oError) {
					console.error("Error fetching data for donut chart", oError);
				}
			});
		},
		_initializeVizFrame: function (vizFrameId, modelName, showDataLabel) {
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;

			var oVizFrame = this.getView().byId(vizFrameId);
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: showDataLabel,
						position: "outside"
					}
				},
				title: {
					visible: true,
					text: showDataLabel ? 'Line Chart' : 'Material Counts'
				}
			});

			var oPopOver = this.getView().byId(showDataLabel ? "idPopOver3" : "idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

			oVizFrame.setModel(this.getView().getModel(modelName));
		},
		_fetchWorkflowItems: function () {
			var sUrl = "/sap/opu/odata/sap/ZC_QU_DG_WORKFLOWITEM_CDS/";
			var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
			var that = this;

			oModel.read("/ZC_QU_DG_WORKFLOWITEM", {
				urlParameters: {
					"$top": 3,
					"$orderby": "Creation_Date_WorkItem asc"
				},
				success: function (oData) {
					debugger
					oData.results.forEach((data) =>
						data['Creation_Date_WorkItem'] = that.formatSapDate(data["Creation_Date_WorkItem"])
					)
					var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSONModel, "workflowItemsModel");
				},
				error: function (oError) {
					console.error("Error fetching workflow items", oError);
				}
			});
		},
		onItemPress: function () {
			alert("efbv")
		},
		graphTest: function () {
			// var oModel = new JSONModel(this.settingsModel);
			// oModel.setDefaultBindingMode(BindingMode.OneWay);
			// this.getView().setModel(oModel,"Setting");
			// var oVizFrame = this.getView().byId("idVizFrame");
			// oVizFrame.setVizProperties({
			// 	title: {
			// 		visible: false
			// 	}
			// });
			this.getView().setModel(this.getOwnerComponent().getModel("GRAPH"), "GRAPH");
		},
		//rakesh notification count
		pushnotificationcount: function () {
			// this.getView().setBusy(true);
			var oModel = this.getOwnerComponent().getModel("NotificationData");
			debugger;
			oModel.read("/ZP_QU_DG_Notification/$count", {
				success: function (oData, oReponse) {
					this.getOwnerComponent().getModel("Notificationcount").setProperty("/notificationCount", oData);
				}.bind(this),
				error: function (error) {
					this.getView().setBusy(false);
				}.bind(this)
			});
		},
		themeApplied: function (oEvent) {
			sap.ui.core.BusyIndicator.hide();

		},
		setThemeBaesdOnTime: function () {
			let themse = this.getView().getModel("THEMES");
			let themeData = this.getView().getModel("THEMES").getData();
			let value = 0;
			if ((new Date()).getHours() > 6 && (new Date()).getHours() < 19) {
				for (let i = 0; i < themeData.Themes.length; i++) {
					if (themeData.Themes[i].id === "sap_horizon") {
						value = i;
					}
				}
				this.setUserTheme("sap_horizon");
			} else {
				for (let i = 0; i < themeData.Themes.length; i++) {
					if (themeData.Themes[i].id === "sap_horizon_dark") {
						value = i;
					}
				}
				this.setUserTheme("sap_horizon_dark");
			}
			for (let k = 0; k < themeData.Themes.length; k++) {
				if (themeData.Themes[k].info === "Selected") {
					this.getView().getModel("THEMES").setProperty("/Themes/" + k + "/info", "");
				}
			}
			this.getView().getModel("THEMES").setProperty("/Themes/" + value + "/info", "Selected");
		},
		onNavtoHome: function () {
			// var that = this;
			// this.recentVisitsData.sort(function (a, b) {
			// 	return that.parseDate(b.description) - that.parseDate(a.description);
			// });
			// // Update the model
			// var oModel = this.getView().getModel("recentVisitsModel");
			// oModel.setProperty("/recentVisits", this.recentVisitsData);
			// var homepage = this.getView().byId("pageContainer").getPages()[0];
			// this.getView().byId("pageContainer").to(homepage);
			var key = 'com.qudgovp';
			var text = 'Dashboard';
			this.getView().byId("pageContainer").getPages().forEach((data, index) => {
				if (index > 0) {
					data.destroy();
				}
			})
			if (sap.ui.getCore().byId(key)) {
				sap.ui.getCore().byId(key).destroy();
				this.createContent(key, text);
				this.getView().byId("pageContainer").to(key);
			} else {
				this.createContent(key, text);
				this.getView().byId("pageContainer").to(key);
			}
			// sap.ui.core.BusyIndicator.show();
			var currentUrl = window.location.href;

			var history = window.history.state.sap.history;
			var length = window.history.state.sap.history.length - 1;
			var lastHistory = history[length];

			if (lastHistory.startsWith("?sap")) {
				var updated = currentUrl.replace(lastHistory.split('&')[1], "") || currentUrl;
				window.location.href = updated;
			} else if (lastHistory === '') { } else {
				lastHistory = lastHistory.replace(/%/g, "%25");
				var updatedUrl = currentUrl.replace(lastHistory, "");
				window.location.href = updatedUrl;
			}
			var exists = this.recentVisitsData.some(function (visit) {
				return visit.namespace === key;
			});

			var currentDateTime = this.formatDate(new Date())
			if (!exists) {
				this.recentVisitsData.push({
					namespace: key,
					description: currentDateTime,
					name: text
				});
				var oModel = this.getView().getModel("recentVisitsModel");
				oModel.setProperty("/recentVisits", this.recentVisitsData);
			} else {
				this.recentVisitsData = this.recentVisitsData.map(function (visit) {
					if (visit.namespace === key) {
						visit.description = currentDateTime;
					}
					return visit;
				});
			}
		},
		_onObjectMatched: function (oEvt) {
			if (this.navigationData.length !== 0) {
				debugger;
				let TargetPageRouteName = oEvt.getParameter("config").name;
				let currPageID = this.getView().byId("pageContainer").getCurrentPage().getId();
				// Read target page id based on route name
				let targetPageID = ""
				if (TargetPageRouteName === "Home" && this.navigationData.length > 0) {
					this.setSelectedMenuItem(this.sideData.NAMESPACE);
				} else {

					for (let k = 0; k < this.navigationData.length; k++) {
						if (this.navigationData[k].navid === TargetPageRouteName) {
							// appid = this.navigationData[k].appid;
							// navid = this.navigationData[k].navid;
							targetPageID = this.navigationData[k].appid;
						}
					}

					if (currPageID !== targetPageID) {
						this.setSelectedMenuItem(targetPageID);
					}

				}

			}

			// sap.ui.getCore().filters = [];
			// sap.ui.getCore().Flag = "";
			// this.getView().setModel(new JSONModel([]), "attachModel");
			// debugger;
			// var oConfig = oEvt.getParameter("config");
			// var flag = false;
			// var appid = "";
			// var navid = "";
			// if (this.navigationData.length === 0 && oConfig.name === "Overview") {
			// 	this.setSelectedMenuItem(this.sideData.NAMESPACE);
			// } else {
			// 	for (var k = 0; k < this.navigationData.length; k++) {
			// 		if (this.navigationData[k].navid === oConfig.name) {
			// 			appid = this.navigationData[k].appid;
			// 			navid = this.navigationData[k].navid;
			// 		}
			// 	}
			// 	//if()
			// 	//this.createContentTest(appid);
			//             //this.setSelectedMenuItem(appid);
			// }

			console.log(this.getView().byId("pageContainer").getPage());
		},
		setSelectedMenuItem: function (sKey) {
			this.getView().byId("idNavList").setSelectedKey(sKey);
			this.getView().byId("pageContainer").to(sKey);
			debugger;
		},
		onItemSelect: function (oEvt) {
			debugger
			var key = oEvt.getParameter('item').getKey();
			var text = oEvt.getParameter('item').getText();
			this.getView().byId("pageContainer").getPages().forEach((data, index) => {
				if (index > 0) {
					data.destroy();
				}
			})
			if (sap.ui.getCore().byId(key)) {
				sap.ui.getCore().byId(key).destroy();
				this.createContent(key, text);
				this.getView().byId("pageContainer").to(key);
			} else {
				this.createContent(key, text);
				this.getView().byId("pageContainer").to(key);
			}
			sap.ui.core.BusyIndicator.show();
			var currentUrl = window.location.href;

			var history = window.history.state.sap.history;
			var length = window.history.state.sap.history.length - 1;
			var lastHistory = history[length];

			if (lastHistory.startsWith("?sap")) {
				var updated = currentUrl.replace(lastHistory.split('&')[1], "") || currentUrl;
				window.location.href = updated;
			} else if (lastHistory === '') { } else {
				lastHistory = lastHistory.replace(/%/g, "%25");
				var updatedUrl = currentUrl.replace(lastHistory, "");
				window.location.href = updatedUrl;
			}
			var exists = this.recentVisitsData.some(function (visit) {
				return visit.namespace === key;
			});

			var currentDateTime = this.formatDate(new Date())
			if (!exists) {
				this.recentVisitsData.push({
					namespace: key,
					description: currentDateTime,
					name: text
				});
				var oModel = this.getView().getModel("recentVisitsModel");
				oModel.setProperty("/recentVisits", this.recentVisitsData);
			} else {
				this.recentVisitsData = this.recentVisitsData.map(function (visit) {
					if (visit.namespace === key) {
						visit.description = currentDateTime;
					}
					return visit;
				});
			}
		},
		formatDate: function (date) {
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getSeconds();
			var ampm = hours >= 12 ? 'PM' : 'AM';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0' + minutes : minutes;
			seconds = seconds < 10 ? '0' + seconds : seconds;
			var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
			var day = date.getDate();
			var month = date.getMonth() + 1; // Months are zero based
			var year = date.getFullYear().toString().slice(-2);
			return (day < 10 ? '0' + day : day) + '/' + (month < 10 ? '0' + month : month) + '/' + year + ' ' + strTime;
		},

		parseDate: function (dateString) {
			var parts = dateString.split(/[\/: ]/);
			var dd = parseInt(parts[0], 10);
			var mm = parseInt(parts[1], 10) - 1; // Month is zero-based
			var yyyy = 2000 + parseInt(parts[2], 10); // Assuming 21st century
			var hh = parseInt(parts[3], 10);
			var min = parseInt(parts[4], 10);
			var sec = parseInt(parts[5], 10);
			var period = parts[6];
			if (period === 'PM' && hh !== 12) {
				hh += 12;
			} else if (period === 'AM' && hh === 12) {
				hh = 0;
			}
			return new Date(yyyy, mm, dd, hh, min, sec);
		},
		websocketonOpen: function () {
			console.log("Web sockect connected");
		},
		websocketonMessage: function (oEvent) {
			// var data = oEvent.getParameters("data");
			var user_id = this.getView().getModel("globalModel").getProperty("/aUserdprofilesata/user_id");
			var pushData = JSON.parse(oEvent.getParameters("data").data);
			if (user_id === pushData.user_id) {
				var oModel = this.getOwnerComponent().getModel("ZP_QU_DG_Notification");
				oModel.read("/ZP_QU_DG_Notification/$count", {
					success: function (oData, oReponse) {
						this.getOwnerComponent().getModel("Notificationcount").setProperty("/notificationCount", parseInt(oData) + 1);

						this._onReadNotifications();
					}.bind(this),
					error: function (error) {
						this.getView().setBusy(false);
					}.bind(this)
				});
			}
		},
		_onOpenSelectionCriteria: function () {
			if (!this.DialogForSelectionItem) {
				this.DialogForSelectionItem = sap.ui.xmlfragment("idUserSettingFragment",
					"com.airdit.qudg.qudglpad.fragments.FavSetting",
					this
				);
				this.getView().addDependent(this.DialogForSelectionItem);
			}
			this.DialogForSelectionItem.open();
		},
		onCloseActionItem: function () {
			this.DialogForSelectionItem.close();
		},

		/// about profile details
		onPressSelectProfile: function (oEvent) {
			if (!this._oPopoverprofile) {
				this._oPopoverprofile = new sap.ui.xmlfragment("com.airdit.qudg.qudglpad.fragments.MyProfile",
					this);
				this.getView().addDependent(this._oPopoverprofile);
			}

			sap.ui.getCore().byId("nameid").setEnabled(false);
			sap.ui.getCore().byId("departid").setEnabled(false);
			sap.ui.getCore().byId("Emailid").setEnabled(false);
			sap.ui.getCore().byId("phoneid").setEnabled(false);

			this._oPopoverprofile.open();
		},
		onCancelProfile: function () {
			this._oPopoverprofile.close();
		},
		onSaveprofile: function () {
			this._oPopoverprofile.close();
		},
		onPressSetting: function (oEvent) {

			if (!this.DialogForUserSettings) {
				this.DialogForUserSettings = sap.ui.xmlfragment("idUserSettingFragment",
					"com.airdit.qudg.qudglpad.fragments.FavSetting",
					this
				);
				this.getView().addDependent(this.DialogForUserSettings);
			}
			this.DialogForUserSettings.open();
			//this.finalCall();

		},

		/// user profile popup
		onPressUserProfile: function (oEvent) {
			var oButton = oEvent.getSource();
			this.byId("Userprofile").openBy(oButton);
		},
		/// sing out
		onPressSignout: function () {

			///	var Url = "https://103.194.234.38:8001/sap/public/bc/icf/logoff?sap-client=100";
			var Url = "/QUDG";
			sap.m.MessageBox.show(
				"Are you sure you want to sign out?", {
				icon: sap.m.MessageBox.Icon.INFORMATION,
				title: "Sign Out",
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						//logoutFromOutlook();
						window.location.href = Url;
					}
				}
			}
			);

		},

		onSideNavButtonPress: function () {
			var toolPage = this.byId("toolPage");
			var sideExpanded = toolPage.getSideExpanded();

			this._setToggleButtonTooltip(sideExpanded);

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var toggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				toggleButton.setTooltip('Large Size Navigation');
			} else {
				toggleButton.setTooltip('Small Size Navigation');
			}
		},

		onPressOpenFavSettings: function () {
			//this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			//this.getOwnerComponent().getRouter().navTo("FavSettings");
			this.getView().byId("pageContainer").to("com.airdit.fav.zpmfav");
		},
		onScanSuccess: function (oEvt) {
			if (oEvt.getParameter("cancelled")) {
				MessageToast.show("Scan cancelled", {
					duration: 1000
				});
			} else {
				this.value = oEvt.getParameter("text");
				// this.scannedDataValidate(oEvt.getParameter("text"));

			}
		},
		value: '',
		scannedDataValidate: function (value) {
			if (!this.selectItemDialog) {
				this.selectItemDialog = sap.ui.xmlfragment(
					"com.airdit.qudg.qudglpad.fragments.SelectType",
					this
				);
				this.getView().addDependent(this.selectItemDialog);
			}
			this.selectItemDialog.open();
		},

		onCancelCloseItemDialog: function () {
			this.selectItemDialog.close();
		},

		onCloseSubscriptionPopup: function () {
			this.subscriptionPopup.close();
		},
		onSaveSubscription: function (oEvent) {
			debugger;
			var data = [...this.getOwnerComponent().getModel("SubscriptionModel").oData];

			for (var i = 0; i < data.length; i++) {
				if (data[i].Subscribe == true) {
					data[i].Subscribe = "x";

				} else {
					data[i].Subscribe = " ";
				}
				// this.userName
				data[i].UserName = "CHALLA0185";

				delete data[i].__metadata;
			}

			var obj = {
				"Category": "",
				"Data": JSON.stringify(data)
			};
			var that = this;
			var model = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZP_QU_DG_NOTIFICATION_CDS", true);
			model.create("/NotifSubscriptionSet", obj, {
				success: function (data) {
					that.subscriptionPopup.close();
					MessageBox.success(data.Message, {
						onClose: function () {
							that.onSettingsTileClick();
						}
					})
				}.bind(this),
				error: function (err) {
					debugger;
					that.subscriptionPopup.close();
					console.log(err);
				}
			})

		},
		// Begin of change - Arun
		handlePressNotification: function (oEvt) {
			if (!this.notifDetails) {
				this.notifDetails = sap.ui.xmlfragment("idNotificationFragment",
					"com.airdit.qudg.qudglpad.fragments.Notifications",
					this
				);
				this.getView().addDependent(this.notifDetails);
			}
			var oNotification_IconTab = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar");
			oNotification_IconTab.setSelectedKey('All');
			this.notifDetails.open();
			this._onreadNotofications(this, "");
		},
		descriptionFormatter: function (sBodyText, sPriokx) {
			return `${sBodyText} - ${sPriokx}`;
		},
		priorityFormatter: function (sValue) {
			if (sValue in PriorityOrder) {
				return sValue;
			}

			return 'Medium';

		},
		daysFormatter: function (sValue) {
			console.log("Date Value:", sValue);

			if (!sValue || sValue.length === 0) {
				return "No Dates";
			}
			// 	if (sValue in Priority) {
			// 	return sValue;
			// }

			let sendDate = new Date(sValue);
			let currentDate = new Date();
			if (isNaN(sendDate.getTime())) {
				return "Invalid Date";
			}
			let formattedDate = sendDate.toDateString();

			// Calculating the time difference
			// of two dates
			let Difference_In_Time =
				currentDate.getTime() - sendDate.getTime();

			// Calculating the no. of days between
			// two dates
			let Difference_In_Days =
				Math.round(Difference_In_Time / (1000 * 3600 * 24));
			return formattedDate + " (" + Difference_In_Days + " Days Ago)";
			// return Difference_In_Days + " Days Ago";
		},
		nameFormatter: function (sValue) {

			if (typeof sValue !== 'string') {
				return "NN"; // Return default value if sValue is not a string
			}

			// If sValue is an empty string
			if (sValue.length === 0) {
				return "NN";
			}

			let names = sValue.split(" ");
			let initial = "";
			if (names.length == 1) {

			} else if (names.length > 1) {
				initial = names[0].charAt(0) + names[names.length - 1].charAt(0);
			}
			return initial.toUpperCase();
		},
		dateFormatter: function (sValue) {
			if (!sValue || sValue.length === 0) {
				return "No Dates";
			}

			return new Date(sValue).toLocaleDateString('en-us', {
				weekday: "long",
				year: "numeric",
				month: "short",
				day: "numeric"
			}).toString();

		},

		_onreadNotofications: function (oScope, NotificationType) {
			let afilters = [];
			var oCountControl = Fragment.byId("idNotificationFragment", "idNotificationCount")

			// if (NotificationType) {
			// 	afilters.push(new sap.ui.model.Filter("notif_id", sap.ui.model.FilterOperator.EQ, NotificationType));
			// }
			sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(true);

			this.getOwnerComponent().getModel("NotificationData").read("/ZP_QU_DG_Notification", {
				// filters: afilters,
				success: function (data) {
					console.log("Data fetched successfully:", data);

					if (data.results && data.results.length > 0) {
						//data.results.forEach(function(notification) {
						//             // Ensure priokx is assigned a default value if empty
						//             if (!notification.priokx || notification.priokx.trim() === '') {
						//                 notification.priokx = 'Very High';
						//             }
						//         });

						//         // Define priority order
						//         var PriorityOrder = {
						//             'Very High': 1,
						//             'High': 2,
						//             'Medium': 3,
						//             'Low': 4,
						//             '': 5 // Treat empty as a lower priority if necessary
						//         };

						//         // Sort data by priority
						//         data.results.sort(function (a, b) {
						//             var aPriority = PriorityOrder[a.priokx] || PriorityOrder['Medium'];
						//             var bPriority = PriorityOrder[b.priokx] || PriorityOrder['Medium'];
						//             return aPriority - bPriority;
						//         });
						data.results.sort(function (a, b) {
							if (a.priokx === "Very high" && b.priokx !== "Very high") {
								return -1;
							}
							if (a.priokx !== "Very high" && b.priokx === "Very high") {
								return 1;
							}
							if (!a.priokx && b.priokx) {
								return 1;
							}
							if (a.priokx && !b.priokx) {
								return -1;
							}
							return 0;
						});
						let oNotificationModel = new sap.ui.model.json.JSONModel({
							results: data.results
						});
						let results = data.results;
						if (data.results.length > 0) {
							oNotificationModel.setProperty("/qmdat", new Date(data.results[0].qmdat));
						}

						this.getView().setModel(oNotificationModel, "PushNotificationModel");
					} else {
						console.error("No results found for the provided NotificationType.");
					}
					//var oNotificationModel = this.getView().getModel("PushNotificationModel");
					//     if (oNotificationModel) {
					//         var count = oNotificationModel.getProperty("/results").length;
					//         oCountControl.setData(count);
					//     } else {
					//         console.error("PushNotificationModel not found.");
					//     }


					sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(false);
				}.bind(this),
				error: function (error) {
					sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(false);
					console.error("Error reading notifications: ", error);
					if (error.responseText) {
						try {
							let errorDetails = JSON.parse(error.responseText);
							console.error("Error details:", errorDetails);
						} catch (e) {
							console.error("Error parsing error response text:", error.responseText);
						}
					}
				}

			});

		},
		_onreadNotofications: function (oScope, NotificationType) {
			let afilters = [];
			var oCountControl = Fragment.byId("idNotificationFragment", "idNotificationCount")

			// if (NotificationType) {
			// 	afilters.push(new sap.ui.model.Filter("group", sap.ui.model.FilterOperator.EQ, NotificationType));
			// }
			sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(true);

			this.getOwnerComponent().getModel("NotificationData").read("/ZP_QU_DG_Notification", {
				// filters: afilters,
				success: function (data) {
					console.log("Data fetched successfully:", data);

					if (data.results && data.results.length > 0) {
						data.results.sort(function (a, b) {
							if (a.priokx === "Very high" && b.priokx !== "Very high") {
								return -1;
							}
							if (a.priokx !== "Very high" && b.priokx === "Very high") {
								return 1;
							}
							if (!a.priokx && b.priokx) {
								return 1;
							}
							if (a.priokx && !b.priokx) {
								return -1;
							}
							return 0;
						});
						 let groupedData = {};
                data.results.forEach(notification => {
                    let dateKey = new Date(notification.qmdat).toDateString(); // Group by date
                    if (!groupedData[dateKey]) {
                        groupedData[dateKey] = [];
                    }
                    groupedData[dateKey].push(notification);
                });

                // Prepare data in the format required by NotificationList
                let finalResults = Object.keys(groupedData).map(date => ({
                    key: date,
                    items: groupedData[date]
                })).sort((a, b) => new Date(b.key) - new Date(a.key));
						let oNotificationModel = new sap.ui.model.json.JSONModel({
							results: data.results,
							 groupedResults: finalResults 
						});
						this.getView().setModel(oNotificationModel, "PushNotificationModel");
					} else {
						console.error("No results found for the provided NotificationType.");
					}

					sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(false);
				}.bind(this),
				error: function (error) {
					sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(false);
					console.error("Error reading notifications: ", error);
					if (error.responseText) {
						try {
							let errorDetails = JSON.parse(error.responseText);
							console.error("Error details:", errorDetails);
						} catch (e) {
							console.error("Error parsing error response text:", error.responseText);
						}
					}
				}

			});

		},

		// groupNotificationsByDate: function (notifications) {
		//     let grouped = {};

		//     notifications.forEach(notification => {
		//         // Extract the date from the notification (adjust the key based on your actual data structure)
		//         let date = notification.qmdat.split('T')[0]; // Format date as YYYY-MM-DD or adjust as needed

		//         if (!grouped[date]) {
		//             grouped[date] = [];
		//         }
		//         grouped[date].push(notification);
		//     });

		//     // Convert the grouped object to an array of groups
		//     return Object.keys(grouped).map(date => ({
		//         date: date,
		//         notifications: grouped[date]
		//     }));
		// },

		_updateModelWithSortedData: function (results) {
			const sortedResults = results.sort((a, b) => {
				if (a.priokx === "Very High" && b.priokx !== "Very High") {
					return -1;
				}
				if (a.priokx !== "Very High" && b.priokx === "Very High") {
					return 1;
				}
				return 0;
			});

			const oNotificationModel = this.getOwnerComponent().getModel("PushNotificationModel");
			if (!oNotificationModel) {
				oNotificationModel = new sap.ui.model.json.JSONModel();
				this.getOwnerComponent().setModel(oNotificationModel, "PushNotificationModel");
			}

			oNotificationModel.setData({
				notifications: sortedResults
			});
		},

		onSearchInNotifications: function (oEvent) {
			var sNotiType = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").getSelectedKey(),
				oList;
			switch (sNotiType) {
				case 'All':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_All");
					this._onSearchInNotifications(this, oEvent, oList)
					break
				case 'Read':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_Read");
					this._onSearchInNotifications(this, oEvent, oList)
					break
				case 'Unread':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_Unread");
					this._onSearchInNotifications(this, oEvent, oList)
					break
			}
		},
		_onSearchInNotifications: function (oScope, oEvent, oList) {
			var oViewModel = oScope.getOwnerComponent().getModel("PushNotificationModel"),
				aArr = [],
				binding,
				filters;
			filters = new Filter({
				filters: [
					// new Filter("notif_type", FilterOperator.Contains, oEvent.getSource().getValue()),
					new Filter("header_text", FilterOperator.Contains, oEvent.getSource().getValue()),
					new Filter("body_text", FilterOperator.Contains, oEvent.getSource().getValue()),
					// new Filter("notif_id", FilterOperator.Contains, oEvent.getSource().getValue()),
					new Filter("user_id", FilterOperator.Contains, oEvent.getSource().getValue()),
					new Filter("app_id", FilterOperator.Contains, oEvent.getSource().getValue())
					// new Filter("mzeit", FilterOperator.Contains, oEvent.getSource().getValue()),
					// new Filter("priority", FilterOperator.Contains, oEvent.getSource().getValue())

				],
				and: false
			});
			binding = oList.getBinding("items");
			aArr.push(filters);
			binding.filter(aArr);
		},
		handleFilterOnNotofication: function (oEvent) {
			var oButton = oEvent.getSource();
			sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationFilterActionSheet").openBy(oButton);
		},
		_onFilterInNotifications: function (oScope, sValue, oList) {
			var oViewModel = oScope.getOwnerComponent().getModel("PushNotificationModel"),
				aArr = [],
				binding,
				filters;
			filters = new Filter({
				filters: [
					new Filter("notif_id", FilterOperator.Contains, sValue)
				],
				and: false
			});
			binding = oList.getBinding("items");
			aArr.push(filters);
			binding.filter(aArr);
		},
		handlePressNotificationFilter: function (oEvent) {
			var sNotiType = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").getSelectedKey(),
				oList;
			switch (sNotiType) {
				case 'All':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_All");
					this._onFilterInNotifications(this, oEvent.getSource().getText(), oList)
					break
				case 'Read':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_Read");
					this._onFilterInNotifications(this, oEvent.getSource().getText(), oList)
					break
				case 'Unread':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_Unread");
					this._onFilterInNotifications(this, oEvent.getSource().getText(), oList)
					break
			}
			sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationFilterActionSheet").close();
		},
		handleSelectionTypeOfNotification: function (oEvent) {
			var sNotiType = oEvent.getParameters('selectedItem').selectedKey;
			switch (sNotiType) {
				case 'All':
					this._onreadNotofications(this, "");
					break
				case 'P':
					this._onreadNotofications(this, "P");
					break
				case 'D':
					this._onreadNotofications(this, "D");
					break
			}
		},
		onItemClose: function (oEvent) {
			return new Promise(function (resolve, reject) {
				var oDModel = oEvent.oSource.getBindingContext("PushNotificationModel");
				var oNotification = oDModel.getObject();
				var notif_id = oNotification.notif_id;
				var sPath = "/ZP_QU_DG_Notification(guid'" + notif_id + "')";
				var oModel = this.getOwnerComponent().getModel("NotificationData");
				console.log("Deleting notification with ID:", notif_id);
				console.log("OData Path:", sPath);
				oModel.remove(sPath, {
					success: function () {
						MessageToast.show("Notification deleted successfully.");
						this._onReadNotifications(this, "D");
						resolve();
					},
					error: function (oError) {
						MessageToast.show("Failed to delete notification.");
						reject(oError);
					}
				});
			}.bind(this));
		},
		isValidGUID: function (guid) {
			var regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
			return regex.test(guid);
		},
		convertBase64ToGUID: function (base64) {
			// Implement base64 to GUID conversion if needed
			// Placeholder function: replace with actual conversion logic
			return base64; // Return as-is for demonstration
		},
		onPressDeleteNotification: function (oEvent) {
			var oSelectedNotification = oEvent.oSource.getBindingContext("PushNotificationModel").getObject(),
				oDataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZP_QU_DG_NOTIFICATION_CDS", true);
			MessageBox.confirm(
				"Are you sure you want to delete this notification ?", {
				title: "Confirmation",
				onClose: function (action) {
					if (action === MessageBox.Action.OK) {
						sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(true);
						oDataModel.callFunction("/DeleteMessage", {
							method: "GET",
							urlParameters: {
								"MsgId": oSelectedNotification.MsgId,
								"NotfId": oSelectedNotification.NotfId,
								"MsgGroupId": oSelectedNotification.MsgGroupId
							},
							success: $.proxy(this._onDeleteNotification_Success, this),
							error: $.proxy(this.onDeleteNotication_Error, this)
						});
					}
				}.bind(this)
			}
			);
		},
		_onDeleteNotification_Success: function (data) {
			var sNotiType = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").getSelectedKey();
			MessageToast.show("Notification deleted");
			this._onreadNotofications(this, sNotiType);
		},
		onDeleteNotication_Error: function (oError) {
			MessageBox.error(JSON.parse(oError.response.body).error.innererror.errordetails[0].message);
		},
		onDeleteMultipleNotofications: function (oEvent) {
			var sNotiType = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").getSelectedKey(),
				oList, aSelectedNotifications, aDeleteNoti = [],
				oDelObj, oPromise, urlParametersoDataModel, aDelEntry,
				oDataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZP_QU_DG_NOTIFICATION_CDS", true);;
			switch (sNotiType) {
				case 'All':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_All");
					break
				case 'Read':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_Read");
					break
				case 'Unread':
					oList = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationList_Unread");
					break
			};
			aSelectedNotifications = oList.getSelectedItems();
			aSelectedNotifications.forEach(function (para) {
				oDelObj = {
					"app_id": para.getBindingContext("PushNotificationModel").getObject().app_id,
					"notif_id": para.getBindingContext("PushNotificationModel").getObject().notif_id,
					"user_id": para.getBindingContext("PushNotificationModel").getObject().user_id
				}
				aDeleteNoti.push(oDelObj)
			});
			if (aSelectedNotifications.length > 0) {
				MessageBox.confirm(
					"Are you sure you want to delete all '" + aSelectedNotifications.length + "' selected notification(s) ?", {
					title: "Confirmation",
					onClose: function (action) {
						if (action === MessageBox.Action.OK) {
							aDelEntry = {
								"Data": JSON.stringify(aDeleteNoti)
							}
							oDataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPM_PUSH_NOTIFICATION_SRV");
							oPromise = this.createEntityValue(oDataModel, "/PushNotificationsSet", aDelEntry); //POST call
							oPromise.then(function (oData) {
								var sNotiType = sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").getSelectedKey();
								sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(false);
								MessageToast.show("Notification(s) deleted");
								this._onreadNotofications(this, sNotiType);
							}.bind(this), function () {
								sap.ui.core.Fragment.byId("idNotificationFragment", "idNotificationIconTabBar").setBusy(false);
								MessageBox.error(JSON.parse(oError.response.body).error.innererror.errordetails[0].message);
							}.bind(this));
						}
					}.bind(this)
				}
				);
			} else {
				MessageBox.information("No notification(s) selected to delete");
			}
		},
		_getCSRFToken: function (oDataModel) { // will provide the csrf token
			var sToken = oDataModel.getHeaders()["x-csrf-token"];
			if (!sToken) {
				oDataModel.refreshSecurityToken(
					function (e, o) {
						sToken = o.headers["x-csrf-token"];
					}, false);
			}
			return sToken;
		},
		success_DelMultNoti: function () {
			MessageToast.show("Notification(s) deleted");
		},
		error_DelMultNoti: function (oError) {
			MessageBox.error(JSON.parse(oError.response.body).error.innererror.errordetails[0].message);
		},
		handleCreateNotoficationAndOrder: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView(),
				sIcon = oEvent.getSource().getIcon();
			switch (sIcon) {
				case 'sap-icon://decline':
					oEvent.getSource().setIcon("sap-icon://sys-add");
					this.byId("idCreateNotiandOrderPopover").close();
					break
				case 'sap-icon://sys-add':
					//oEvent.getSource().setIcon("sap-icon://decline");
					if (!this._pPopover) {
						this._pPopover = Fragment.load({
							id: oView.getId(),
							name: "com.sap.airdit.zpmcockpit.fragments.CreateNotifiAndOrder",
							controller: this
						}).then(function (oPopover) {
							oView.addDependent(oPopover);
							return oPopover;
						});
					}
					this._pPopover.then(function (oPopover) {
						oPopover.openBy(oButton);
					});
					break
			};
		},
		onCloseNotifiOrderPopOver: function () {
			this.byId("idCreateNotiandOrderPopover").close();
			this.getView().byId("idCreateNotoficationAndOrderBtn").setIcon("sap-icon://sys-add");
		},
		handlePresssCreateOrder: function (oEvent) { // navigate to create order app
			// if (sap.ushell == undefined) {
			// sap.ui.getCore().BusyDialog.close();
			//var url = "/sap/bc/ui5_ui5/sap/zmanageorder/index.html"
			//	window.location.replace(url);
			//window.open(url);
			// } else {
			// 	var hash = "",
			// 		oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// 	hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			// 		target: {
			// 			semanticObject: "INDVORDDISP",
			// 			action: "Manage"
			// 		}
			// 	})) || "";
			// 	oCrossAppNavigator.toExternal({
			// 		target: {
			// 			shellHash: hash
			// 		}
			// 	});
			// }
			this.byId("idCreateNotiandOrderPopover").close();
			this.getView().byId("idCreateNotoficationAndOrderBtn").setIcon("sap-icon://sys-add");
			this.getView().byId("pageContainer").to(this.getView().createId("zmanageorder"));
		},
		handlePresssCreateNotif: function (oEvent) { // navigate to create notification app
			// if (sap.ushell == undefined) {
			// sap.ui.getCore().BusyDialog.close();
			//var url = "/sap/bc/ui5_ui5/sap/zmanagenotify/index.html"
			//	window.location.replace(url);
			//window.open(url);
			// } else {
			// 	var hash = "",
			// 		oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// 	hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			// 		target: {
			// 			semanticObject: "PMINDNOTIF",
			// 			action: "Manage"
			// 		}
			// 	})) || "";
			// 	oCrossAppNavigator.toExternal({
			// 		target: {
			// 			shellHash: hash
			// 		}
			// 	});
			// }
			this.byId("idCreateNotiandOrderPopover").close();
			this.getView().byId("idCreateNotoficationAndOrderBtn").setIcon("sap-icon://sys-add");
			this.getView().byId("pageContainer").to(this.getView().createId("zmanagenotify"));
		},
		// End of change - Arun
		onPushNotificationPress: function (oEvent) {
			debugger;
			var hash = "";
			var data = oEvent.oSource.getBindingContext("PushNotificationModel").getObject();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (data.Description == "Order") {
				var Aufnr = data.Aufnr;
				hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "ORDERDISP",
						action: "Manage"
					},
					params: {
						"OrdNo": Aufnr
					}
				})) || ""; // generate the Hash to display a Supplier
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});
			} else if (data.Description == "Notification") {
				var Qmnum = data.Qmnum;
				hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "PMNOTIFDISP",
						action: "Display"
					},
					params: {
						"NotifNo": Qmnum
					}
				})) || ""; // generate the Hash to display a Supplier
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});
			}
		},
		onCloseNotification: function (oEvent) {
			debugger;
			var data = oEvent.oSource.getBindingContext("PushNotificationModel").getObject();

			var that = this;
			var model = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPM_PUSH_NOTIFICATION_SRV", true);
			// model.callFunction("/DeleteMessage",{
			// 	success:function(data)
			// 	{
			// 		debugger;
			// 	},
			// 	error:function(err)
			// 	{
			// 		console.log(err);
			// 	}
			// })
			sap.ui.getCore().byId("notificationList").setBusy(true);
			model.callFunction("/DeleteMessage", {
				method: "GET",
				urlParameters: {
					"MsgId": data.MsgId,
					"NotfId": data.NotfId,
					"MsgGroupId": data.MsgGroupId
				},
				success: function (data) {

					this.handlePressNotification();
				}.bind(this),
				error: function (err) {
					debugger;
					MessageBox.error(JSON.parse(err.response.body).error.innererror.errordetails[0].message);
				}
			})

		},
		onOkNotification: function () {
			this.notifDetails.close();
			this.notifDetails.destroy(true);
			this.notifDetails = undefined;
		},
		onCancelNotification: function () {
			this.notifDetails.close();
			this.notifDetails.destroy(true);
			this.notifDetails = undefined;
		},
		onFlagPress: function (oEvent) {
			var data = oEvent.oSource.getBindingContext("PushNotificationModel").getObject();
			var that = this;
			var model = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPM_PUSH_NOTIFICATION_SRV", true);
			sap.ui.getCore().byId("notificationList").setBusy(true);
			model.callFunction("/Flag", {
				method: "GET",
				urlParameters: {
					"MsgId": data.MsgId,
					"NotfId": data.NotfId,
					"MsgGroupId": data.MsgGroupId
				},
				success: function (data) {
					debugger;
					this.handlePressNotification();
				}.bind(this),
				error: function (err) {
					debugger;
					MessageBox.error(JSON.parse(err.response.body).error.innererror.errordetails[0].message);
				}
			})
		},
		// edit my profile
		onEdit: function () {
			sap.ui.getCore().byId("nameid").setEnabled(true);
			sap.ui.getCore().byId("departid").setEnabled(true);
			sap.ui.getCore().byId("Emailid").setEnabled(true);
			sap.ui.getCore().byId("phoneid").setEnabled(true);

		},

		PressDateRange: function () {
			if (!this.Datesearch) {
				this.Datesearch = sap.ui.xmlfragment(
					"com.sap.airdit.zpmcockpit.fragments.favourite",
					this
				);
				this.getView().addDependent(this.Datesearch);
				this.Datesearch.open();
			}
			this.Datesearch.open();
			this._getDatesearch();

		},
		_getDatesearch: function () {
			var that = this;
			//sap.ui.core.BusyIndicator.show();
			var globalModel = this.getView().getModel("globalModel");
			this.oModel.read("/DateSearchSet", {
				success: function (data, sResponse) {
					globalModel.setProperty("/aDatedata", data.results);
					sap.ui.core.BusyIndicator.hide();
					that.getView().setBusy(false);

				},
				error: function (eResponse) {
					sap.ui.core.BusyIndicator.hide();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					sap.m.MessageBox.error(that.getResourceBundle().getText(""), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					});
					that.getView().setBusy(false);
				}
			});

		},
		userSepecificationCall: function () {
			var that = this;
			//this.getView().setBusy(true);
			//sap.ui.core.BusyIndicator.show();
			var globalModel = this.getView().getModel("globalModel");
			var oModel = this.getOwnerComponent().getModel();
			//	this.oModel.read("/UserSpecificSet('')", {
			oModel.read("/UserSpecificSet('')", {
				success: function (oData, oReponse) {
					//sap.ui.core.BusyIndicator.hide();
					this.getView().setBusy(false);
					if (oData.Email != "") {
						oData.Fullname = oData.Email.split("@")[0].replace(".ext", " ");
					}
					globalModel.setProperty("/aUserdprofilesata", oData);
					// if (oData.Default) {
					// 	this.gettingTileContent('Favourite', new Filter([
					// 		new Filter("Flag", FilterOperator.EQ, "F")
					// 	]));
					// 	this.getOwnerComponent().getModel("settingsModel").setProperty("/ActionItem", "Favourite");
					// 	sap.ui.getCore().Flag = "F";
					// 	sap.ui.getCore().filters = [new Filter([
					// 		new Filter("Flag", FilterOperator.EQ, "F")
					// 	])];
					// } else {
					// 	this.gettingTileContent('SAP', new Filter([
					// 		new Filter("Flag", FilterOperator.EQ, "A")
					// 	]));
					// 	this.getOwnerComponent().getModel("settingsModel").setProperty("/ActionItem", "SAP");
					// 	sap.ui.getCore().Flag = "A";
					// 	sap.ui.getCore().filters = [new Filter([
					// 		new Filter("Flag", FilterOperator.EQ, "A")
					// 	])];
					// }
					// that.getView().byId("ActionId").setSelectedKey("O");
					// that.getView().byId("statusid").setSelectedKey("ALL");
					// that.getView().byId("flagorder").setSelectedKey("AUART");
					// that.getView().byId("ActionNotifyID").setSelectedKey("O");
					// that.getView().byId("ststusnotifyid").setSelectedKey("ALL");
					// that.getView().byId("flagNotifyID").setSelectedKey("QMART");
					// that._getOpenNotificationservicesChart();
					// that._getOpenorderServicesChart();
				}.bind(this),
				error: function (error) {
					this.getView().setBusy(false);
					sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			});
		},
		onSaveSetting: function (oEvent) {
			this.updateFavConfig(this.getView().getModel("FavSettings").getData().Flag);

			let subData = [];
			for (let i = 0; i < this.getView().getModel("SubscriptionModel").getData().length; i++) {
				let subObject = {};
				subObject.Category = this.getView().getModel("SubscriptionModel").getData()[i].Category;
				let cat = "";
				if (this.getView().getModel("SubscriptionModel").getData()[i].Subscribe) {
					cat = "X";
				} else {
					cat = "";
				}

				subObject.Subscribe = cat;
				subData.push(subObject);
			}
			this.updateSubscription(JSON.stringify(subData));

			let srchData = [];
			for (let i = 0; i < this.getView().getModel("globalModel").getData().aDatedata.length; i++) {
				let subObj = {};
				subObj.APPLICATION = this.getView().getModel("globalModel").getData().aDatedata[i].Application;
				subObj.FROM_DAYS = this.getView().getModel("globalModel").getData().aDatedata[i].FromDays.toString();
				subObj.TO_DAYS = this.getView().getModel("globalModel").getData().aDatedata[i].ToDays.toString();

				srchData.push(subObj);
			}
			this.updateDateSearch(JSON.stringify(srchData));

		},
		updateFavConfig: function (Flag) {
			debugger;
			let dataPayload = {
				"InternetUser": "",
				"Flag": Flag
			};

			this.getOwnerComponent().getModel().create("/RoleMaintenaceSet", dataPayload, {

				success: function (oData, oReponse) {

				}.bind(this),
				error: function (error) {

				}.bind(this)
			});
		},
		updateSubscription: function (Data) {
			debugger;
			let dataPayload = {
				"InternetUser": "",
				"Data": Data
			}

			this.getOwnerComponent().getModel("ZPM_PUSH_NOTIFICATION_SRV").create("/NotifSubscriptionSet", dataPayload, {

				success: function (oData, oReponse) {

				}.bind(this),
				error: function (error) {

				}.bind(this)
			});
		},
		updateDateSearch: function (Data) {
			debugger;
			let dataPayload = {
				"Data": Data
			}

			this.getOwnerComponent().getModel().create("/DateSearchSet", dataPayload, {

				success: function (oData, oReponse) {

				}.bind(this),
				error: function (error) {

				}.bind(this)
			});
		},
		onSaveDateRange: function () {
			var that = this;
			var Data = [];
			var globalModel = this.getView().getModel("globalModel");
			var aDatedata = globalModel.getProperty("/aDatedata");
			var bflag = true;
			for (let i = 0; i < aDatedata.length; i++) {
				//		if (aDatedata[i].FromDays == 0 && aDatedata[i].ToDays <= 30) {

				var atemp = {
					"APPLICATION": aDatedata[i].Application,
					"FROM_DAYS": aDatedata[i].FromDays,
					"TO_DAYS": aDatedata[i].ToDays,

				};
				Data.push(atemp);
				// } else {
				// 	bflag = false;
				// }

			}
			var oPayload = {
				"Data": JSON.stringify(Data)
			};
			that.getView().setBusy(true);
			if (bflag == true) {
				var busyDialog = new sap.m.BusyDialog();
				busyDialog.open();

				this.oModel.create("/DateSearchSet",
					oPayload, {
					success: function (data, sResponse) {
						that.getView().setBusy(false);
						busyDialog.close();
						sap.m.MessageBox.success(data.Message);
						that.userSepecificationCall();
						that.Datesearch.close();

					},
					error: function (eResponse) {
						that.getView().setBusy(false);
						busyDialog.close();

						var messagesArr = JSON.parse(eResponse.responseText).error.innererror.errordetails;

						var message1 = [];
						for (var i = 0; i < messagesArr.length; i++) {
							if (JSON.parse(eResponse.responseText).error.innererror.errordetails[i].code == "") {
								var message = JSON.parse(eResponse.responseText).error.innererror.errordetails[i].message;
								message1.push(message);
							}
						}
						var strMessage = message1.join(",\r\n");
						sap.m.MessageBox.error(
							strMessage
							// "Sorry, a technical error occurred! Please try again later.", {
							// 	styleClass: bCompact ? "sapUiSizeCompact" : ""
							// }
						);
					}
				});
			} else {
				sap.m.MessageBox.information("Please check From days and To days values");

			}
		},
		onCloseDate: function () {
			this.Datesearch.close();
		},
		onCloseSettingDialog: function (oevent) {
			this.DialogForUserSettings.close();
		},
		onPressUserSettingItems: function (oEvent) {
			debugger;

			let page = sap.ui.core.Fragment.byId("idUserSettingFragment", "SplitAppDemo");
			//let page = this.byId("SplitAppDemo");

			let bindingPath = oEvent.getSource().getBindingContextPath();
			let data = this.getView().getModel("SETTINGDATA").getProperty(bindingPath);
			let pageId = sap.ui.core.Fragment.createId("idUserSettingFragment", data.id);
			//let pageId = this.createId(data.id);

			//let eleId  = sap.ui.core.Fragment.createId("idUserSettingFragment", data.eleid);
			let ele = sap.ui.core.Fragment.byId("idUserSettingFragment", data.eleid);

			//let ele = this.byId(data.eleid);
			ele.bindElement({
				path: bindingPath,
				model: "SETTINGDATA"
			});
			page.toDetail(pageId);
		},
		onPressTheme: function (oEvent) {
			let page = sap.ui.core.Fragment.byId("idUserSettingFragment", "SplitAppDemo");
			let bindingPath = oEvent.getSource().getBindingContextPath();
			let isSelected = this.getView().getModel("THEMES").getProperty(bindingPath);
			if (isSelected.info !== "Selected") {

				let themeData = this.getView().getModel("THEMES").getData();
				for (let i = 0; i < themeData.Themes.length; i++) {
					if (themeData.Themes[i].info === "Selected") {
						this.getView().getModel("THEMES").setProperty("/Themes/" + i + "/info", "");
					}
				}

				this.getView().getModel("THEMES").setProperty(bindingPath + "/info", "Selected");

			}
			this.setUserTheme(isSelected.id);
			//this.checkThemeAndApplyImage();

		},
		setUserTheme: function (themeId) {
			//sap.ui.core.BusyIndicator.show();
			Theming.setTheme(themeId);
		},
		usersettingListUpdateFinished: function (oevent) {
			debugger;
			let page = sap.ui.core.Fragment.byId("idUserSettingFragment", "SplitAppDemo");
			let list = sap.ui.core.Fragment.byId("idUserSettingFragment", "ShortProductList");
			var firstItem = list.getItems()[0];
			list.setSelectedItem(firstItem, true);
			let pageId = sap.ui.core.Fragment.createId("idUserSettingFragment", "Themes");

			let ele = sap.ui.core.Fragment.byId("idUserSettingFragment", "themesetting");
			ele.bindElement({
				path: "/settingnames/0",
				model: "SETTINGDATA"
			});
			page.toDetail(pageId);
			// let page = this.byId("SplitAppDemo");
			// let list = this.byId("ShortProductList");
			// var firstItem = list.getItems()[0];
			// list.setSelectedItem(firstItem, true);
			// let pageId = this.createId("fav");

			// let ele = this.byId("favhsetting");
			// ele.bindElement({
			// 	path: "/settingnames/0",
			// 	model: "SETTINGDATA"
			// });
			// page.toDetail(pageId);
		},
		readNotificationSubscrption: function () {
			//	var model = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPM_PUSH_NOTIFICATION_SRV", true);
			var model = this.getOwnerComponent().getModel("ZPM_PUSH_NOTIFICATION_SRV");
			model.read("/NotifSubscriptionSet", {
				success: function (data) {
					debugger;
					var dat = data.results;
					dat.sort((a, b) => {
						if (a.Description[0] < b.Description[0]) {
							return -1;
						} else {
							return 0;
						}
					})
					this.getOwnerComponent().getModel("SubscriptionModel").setData(dat);

				}.bind(this),
				error: function (err) {
					debugger;
				}
			})

		},
		_getDatesearch: function () {
			var that = this;
			//sap.ui.getCore().BusyDialog.open();
			var globalModel = this.getView().getModel("globalModel");
			this.getOwnerComponent().getModel().read("/DateSearchSet", {
				success: function (data, sResponse) {
					globalModel.setProperty("/aDatedata", data.results);
					// sap.ui.getCore().BusyDialog.close();
					// that.getView().setBusy(false);

				},
				error: function (eResponse) {
					//sap.ui.getCore().BusyDialog.close();
					// var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;FavSettings
					// sap.m.MessageBox.error(that.getResourceBundle().getText(""), {
					// 	styleClass: bCompact ? "sapUiSizeCompact" : ""
					// });
					// that.getView().setBusy(false);
				}
			});

		},
		onChangeFav: function (oEvent) {
			let state = oEvent.getParameters("state");
			let data = this.getOwnerComponent().getModel("FavSettings").getData();
			if (data.Flag) {
				this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/infoState", "Success");
				this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/info", "Enabled");
			} else {
				this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/infoState", "Error");
				this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/info", "Disabled");
			}

		},
		_readFavSettings: function () {

			debugger;
			//sap.ui.getCore().BusyDialog.open();
			var globalModel = this.getView().getModel("");
			this.oModel.read("/RoleMaintenaceSet('')", {
				success: function (data, sResponse) {
					// globalModel.setProperty("/aDatedata", data.results);
					this.getOwnerComponent().getModel("FavSettings").setData(data);

					if (data.Flag) {
						this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/infoState", "Success");
						this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/info", "Enabled");
					} else {
						this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/infoState", "Error");
						this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/info", "Disabled");
					}

					// sap.ui.getCore().BusyDialog.close();
					// that.getView().setBusy(false);

				}.bind(this),
				error: function (eResponse) {
					//sap.ui.getCore().BusyDialog.close();
					// var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					// sap.m.MessageBox.error(that.getResourceBundle().getText(""), {
					// 	styleClass: bCompact ? "sapUiSizeCompact" : ""
					// });
					// that.getView().setBusy(false);
				}.bind(this)
			});

		},
		userSettingSelChange: function (oevent) {
			debugger;
		},
		// returnRightPanrlData: function () {
		// 	return new Promise(function (resolve, reject) {
		// 		let filters = [];
		// 		filters.push(new Filter("Launchpadtype", FilterOperator.EQ, "01"));
		// 		this.getOwnerComponent().getModel("ZPM_APPS_MANAGE_SRV").read("/RootSet", {
		// 			filters: filters,
		// 			success: function (oData, oReponse) {
		// 				resolve(oData);
		// 			},
		// 			error: function (error) {
		// 				reject(error);
		// 			}
		// 		});

		// 	}.bind(this));
		// },
		returnFavSettings: function () {
			return new Promise(function (resolve, reject) {

				this.getOwnerComponent().getModel().read("/RoleMaintenaceSet('')", {

					success: function (oData, oReponse) {
						resolve(oData);
					},
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},
		returnSubscription: function () {
			return new Promise(function (resolve, reject) {
				var model = this.getOwnerComponent().getModel("ZPM_PUSH_NOTIFICATION_SRV");
				model.read("/NotifSubscriptionSet", {

					success: function (oData, oReponse) {
						resolve(oData);
					},
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},
		returnSearchData: function () {
			return new Promise(function (resolve, reject) {
				var globalModel = this.getView().getModel("globalModel");
				this.oModel.read("/DateSearchSet", {

					success: function (oData, oReponse) {
						resolve(oData);
					},
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},
		finalCall: function () {
			//sap.ui.core.BusyIndicator.show();
			this.getView().setModel(this.getOwnerComponent().getModel("THEMEDATA"), "THEMES");
			let panelData = this.returnFavSettings();
			panelData.then(function (data) {
				this.getOwnerComponent().getModel("FavSettings").setData(data);

				if (data.Flag) {
					this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/infoState", "Success");
					this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/info", "Enabled");
				} else {
					this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/infoState", "Error");
					this.getView().getModel("SETTINGDATA").setProperty("/settingnames/0/info", "Disabled");
				}

				let subscriptionData = this.returnSubscription();
				subscriptionData.then(function (data) {
					var dat = data.results;
					dat.sort((a, b) => {
						if (a.Description[0] < b.Description[0]) {
							return -1;
						} else {
							return 0;
						}
					})
					this.getOwnerComponent().getModel("SubscriptionModel").setData(dat);
					let searchData = this.returnSearchData();
					searchData.then(function (data) {
						debugger;
						this.getView().getModel("globalModel").setProperty("/aDatedata", data.results);
						sap.ui.core.BusyIndicator.hide();
						this.DialogForUserSettings.open();
					}.bind(this)).catch(function (error) {

					}.bind(this));

				}.bind(this)).catch(function (error) {

				}.bind(this));

			}.bind(this)).catch(function (error) {

			}.bind(this));
		}

	});

});