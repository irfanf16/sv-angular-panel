export const environment = {

  production: false,

  title: 'Staging Environment Heading',
  apiURL: 'https://staging-backoffice.staffviz.com/',
  secretKey: "ABC56EABCDDEF123ERD4EF123ERD456E",
  apiBASEURL:"https://staging-backofficeapi.staffviz.com/",

  liveImagesUrl: ''
};

if (environment.production) {
  environment.liveImagesUrl = "https://api.staffviz.com/file/"
} else {
  // Set a different value if production is false
  environment.liveImagesUrl =  environment.apiURL
}
