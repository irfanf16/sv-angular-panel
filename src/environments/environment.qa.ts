export const environment = {

  production: false,

  title: 'QA Environment Heading',

  apiURL: 'https://qa-backoffice.staffviz.io/',
  secretKey: "ABC56EABCDDEF123ERD4EF123ERD456E",
  apiBASEURL:"https://qa-backofficeapi.staffviz.io/",
  liveImagesUrl: ''
};

// Set liveImagesUrl based on the value of production
if (environment.production) {
  environment.liveImagesUrl = "https://api.staffviz.com/file/"
} else {
  // Set a different value if production is false
  environment.liveImagesUrl =  environment.apiURL
}

