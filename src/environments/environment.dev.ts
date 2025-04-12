export const environment = {
  production: false,
  title: 'Dev Environment Heading',
  apiURL: 'http://192.168.6.22:9095/',
  secretKey: "ABC56EABCDDEF123ERD4EF123ERD456E",
  apiBASEURL:"http://192.168.6.22:9094/",
  liveImagesUrl: ''
};

// Set liveImagesUrl based on the value of production
if (environment.production) {
  environment.liveImagesUrl = "https://api.staffviz.com/file/";
} else {
  // Set a different value if production is false
  environment.liveImagesUrl =  environment.apiURL
}
