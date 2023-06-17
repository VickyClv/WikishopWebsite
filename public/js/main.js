// Run init() after the page is loaded
window.addEventListener('load', init);


var isIndex = true;
var radios;

/* Gets the page URL. If it contains the word index it calls the function indexLoad, given the 
url to retrieve the data, so that it can fill the template. If not, it will retrieve the category 
ID from the params and constructs the correct URL to retrieve the wanted data. Then it calls the 
function categoriesLoad with the contructed URLs, so that it can fill the page template. */
function init() {
    var documentURL = document.URL;
    isIndex = documentURL.includes("index");

    if (isIndex) {
        let url_categories = "https://wiki-shop.onrender.com/categories";
        indexLoad(url_categories);
    }
    else {
        let currentURL = new URL(documentURL);
        let currentParams = new URLSearchParams(currentURL.search);
        let currentId = currentParams.get("categoryId");
        let url_subcategories = "https://wiki-shop.onrender.com/categories/" + currentId + "/subcategories";
        let url_products = "https://wiki-shop.onrender.com/categories/" + currentId + "/products";
        categoriesLoad(url_subcategories, url_products);
    }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Index.html
/* Uses the Fetch API to get the data needed to fill the index page. */
function indexLoad(url) {
    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    let fetch_data = {
        method: "GET",
        headers: myHeaders
    }

    fetch(url, fetch_data)
    .then(response => response.json() )
    .then(obj => {
        listCreatingProcessIndex(obj)
    })
    .catch(error => {
        console.log(error)
    })
}

/* Fills the Handlebars template in index.html using the fetched data */
function listCreatingProcessIndex(obj) {
    let categoriesTemplateScript = document.getElementById('categories-list-template').textContent;
    window.templates = {}
    
    window.templates.categoriesList = Handlebars.compile(categoriesTemplateScript);

    let categoriesList = document.getElementById("categories-list");

    let listHTMLContent = templates.categoriesList({
        list: obj
    });
    categoriesList.innerHTML = listHTMLContent;

    urlCreator();
}

/* Creates the URL of each category using the Browser API in order to fetch the correct data 
on the category.html and updates the href. */
function urlCreator() {
    var elms = document.querySelectorAll("[id='link']");

    for(var i = 0; i < elms.length; i++) {
        var categoriesId = elms[i].getAttribute("data-category-id");

        var idInt = parseInt(categoriesId);

        let url = new URL("http://localhost:8080/category.html");
        let params = new URLSearchParams(url.search);
        
        params.set('categoryId', idInt);

        var updatedURL = new URL("http://localhost:8080/category.html?" + params.toString())

        elms[i].href = updatedURL;
    }
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Category.html
/* Uses the Fetch API to get the data needed to fill the category page. */
function categoriesLoad(url_subcategories, url_products) {
    Promise.all([
        fetch(url_subcategories),
        fetch(url_products)
    ]).then(function (responses) {
        return Promise.all(responses.map(function (response) {
            return response.json();
        }));
    }).then(function (data) {
        listCreatingProcessCategory(data)
    }).catch(function (error) {
        console.log(error);
    }); 
}

/* Fills the Handlebars template in category.html using the fetched data */
function listCreatingProcessCategory(obj) {   
    let subcategoriesTemplateScript = document.getElementById('subcategories-products-template').textContent;
    window.templates = {}
    
    window.templates.subcategoriesList = Handlebars.compile(subcategoriesTemplateScript)
    
    let categoriesList = document.getElementById("sub-categories-products-list");

    let listHTMLContent = templates.subcategoriesList({
        list: obj
    });
    categoriesList.innerHTML = listHTMLContent;

    radios = document.querySelectorAll("[id='subCateg']");
    radioEvent();
}

/* Exercise 2 */
/* For every radio button it adds an EventListener so that when one gets checked it will take 
the subcategory id and use it to filter the products that are in that subcategory. The rest of
the products don't appear unless the button "All" is checked or the subcategory which they 
belong to. (Also every time it makes sure that only one radio button is checked at a time) */
function radioEvent() {
    for (var j = 0; j < radios.length; j++) {
        radios[j].addEventListener('change', function() {
            for (var k = 0; k < radios.length; k++) {
                if (radios[k] != this) {
                    radios[k].checked = false;
                }
            }

            var current_id = this.getAttribute("data-subcategory-id-radio");

            var products = document.querySelectorAll("[id='product']");

            if (current_id == "0") {
                for (let k = 0; k < products.length; k++) {
                    products[k].style.display = "initial";
                }
            }
            else {
                for (let k = 0; k < products.length; k++) {
                    if (products[k].getAttribute("data-subcategory-id") == current_id) {
                        products[k].style.display = "initial";
                    }
                    else {
                        products[k].style.display = "none";
                    }
                }
            }
        });
    }
}


