#humpback-core-pack
This is the component that initiates all the core frontend logic.

##Angular Humpack (humpbackSails.io.js)
Connects to the humpback JS-data provder to make calls to the server. 

##CMS
Handles routing information and cacheing of server side templates
from the database.

##API 
Works with JS-data to make an easy and reusable resource system.
Allows pagination, filtering, and more!

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

		//Set this so it's never empty
		$scope.thisportfolio = $scope.portfolio.selected;

		//Read from the Api
		$scope.portfolio.read($stateParams.id)
		.then(function(thisportfolio){
			utils.development(thissku);
		});

		//Bind thisportfolio so that it updates from incoming sockets requests.
		DS.bindOne('portfolio', $stateParams.id, $scope, 'thisportfolio');
	})
	...

```

