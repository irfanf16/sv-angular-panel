export const environment = {

  production: true,

  title: 'Production Environment Heading',
  apiURL: 'https://backoffice.staffviz.com',
  secretKey: "ABC56EABCDDEF123ERD4EF123ERD456E",
  apiBASEURL:"https://backofficeapi.staffviz.com/",
  liveImagesUrl: ''

};

// Set liveImagesUrl based on the value of production
if (environment.production) {
  environment.liveImagesUrl = "https://api.staffviz.com/file/"
} else {
  // Set a different value if production is false
  environment.liveImagesUrl = 'https://backoffice.staffviz.com'
}
