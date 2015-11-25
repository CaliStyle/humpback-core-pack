#humpback-core-pack
This is the component that initiates all the core frontend logic.

##Angular Humpack (humpbackSails.io.js)
Connects to the humpback JS-data provider to make calls to the server. 

##CMS
Handles routing information and cacheing of server side templates
from the database.

##API 
Works with JS-data to make an easy and reusable resource system.
Allows pagination, filtering, and more!

###Search Example
```js
	...
	.controller( 'PortfolioCtrl', function PortfolioController( $scope, DS, Api ) {
		
		$scope.category = new Api('category', {
			criteria: { 
				name: 'portfolio' 
			}
		});

		$scope.thiscategory = $scope.category.selected;

		$scope.category.Routes = new Api('route');

		$scope.category.search()
		.then(function(categories){
			console.log(categories);
			$scope.thiscategory = $scope.category.selected = categories[0];
			$scope.category.Routes.options = {bypassCache: true, endpoint: '/category/' + $scope.thiscategory.id + '/routes'};
			$scope.category.Routes.init();
		});

	})
	...
```
###Create Item example
```js
	...
	.controller( 'PortfolioPieceCtrl', function PanelProductsHostsNewController( $scope, $state, $stateParams, DS, Api, utils ) {

		//Init Piece
		$scope.portfolio = new Api('portfolio', {
			//add this option incase the frontend needs to know if this is new
			isNew: true
		});

		//Initiate this so it is bound to the entity that will be created
		$scope.thisportfolio = $scope.portfolio.selected;
		
		//Create Piece
		$scope.createPiece = function(pieceForm){
			//Add all your attributes
			var create = {
				name: $scope.thispiece.name
			};

			$scope.portfolio.create(create)
			.then(function(thisportfolio){
				//redirect after the portfolio peice is created
				$state.go('portofolio.view', {id: thisportfolio.id});
			});
		}

	})
	...
```

###Read Item example
```js
	...
	.controller( 'PortfolioPieceCtrl', function PortfolioPieceController( $scope, $stateParams DS, Api ) {
		
		//Initiate the Api
		$scope.portfolio = new Api('portfolio', {
			options: {
				params: {
					//Populate a collection
					populate: 'images'
				}
			}
		});

		//Set this so it's never undefined
		$scope.thisportfolio = $scope.portfolio.selected;

		//Read from the Api
		$scope.portfolio.read($stateParams.id)
		.then(function(thisportfolio){
			utils.development(thisportfolio);
		});

		//Bind thisportfolio so that it updates from incoming sockets requests.
		DS.bindOne('portfolio', $stateParams.id, $scope, 'thisportfolio');
	})
	...

```

###Update Item example
```js
	...
	.controller( 'PortfolioPieceCtrl', function PortfolioPieceController( $scope, $stateParams DS, Api ) {
		//Initiate the Api
		$scope.portfolio = new Api('portfolio', {
			options: {
				params: {
					//Populate a collection
					populate: 'images'
				}
			}
		});

		//Set this so it's never undefined
		$scope.thisportfolio = $scope.portfolio.selected;

		//Read from the Api
		$scope.portfolio.read($stateParams.id)
		.then(function(thisportfolio){
			utils.development(thissku);
		});

		//Bind thisportfolio so that it updates from incoming sockets requests.
		DS.bindOne('portfolio', $stateParams.id, $scope, 'thisportfolio');

		$scope.updatePiece = function(){
				
			var update = {
				id: $scope.thisportfolio.id,
				name: $scope.thisportfolio.name
			};

			$scope.protfolio.update(update)
			.then(function(thisportfolio){
				$state.go('portfolio');
			});	
		}
		
	})
	...
```

###Delete Item example
```js
	...
	.controller( 'PortfolioPieceCtrl', function PortfolioPieceController( $scope, $stateParams DS, Api ) {
		
		//Initiate the Api
		$scope.portfolio = new Api('portfolio');



		$scope.deletePiece = function(){
			$scope.protfolio.delete($scope.thisportfolio)
			.then(function(thisportfolio){
				$state.go('portfolio');
			});	
		}
	})
	...
```

###Upload files example
```js
	...
	.controller( 'PanelProductsCtrl', function PortfolioPieceController( $scope, $state, $stateParams, DS, Api, utils, $timeout ) {


		//Imports
		$scope.imports = new Api('portfolio',{
			//Make an empty files array we can reference on the front end
			files: [],
			//Make the overall progress 0
			progress: 0,
			//Set the endpoint to the import controller
			options: {
				endpoint: '/portfolio/import'
			}
		});

		//Call this when ready to import selected files
		$scope.importFiles = function (importForm) {
			$scope.imports.upload()
			.then(function(files){
				$scope.imports.progress = 0;
				$scope.imports.files = [];
			});
		};
	})
	...
```


