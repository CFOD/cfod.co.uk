window.onload = () => {
    fetch('json/countries.json')
      .then(response => response.json())
      .then(data => {
        const countriesData = data;
  
        const url = new URLSearchParams(window.location.search);
        const country = url.get('country');
  
        if (country && countriesData.countries.hasOwnProperty(country)) {
          const countryInfo = countriesData.countries[country];
          console.log(countryInfo);
  
          document.querySelectorAll("img")[0].src = "imgs/" + countryInfo.img;
          document.querySelectorAll("h1")[1].innerText = countryInfo.title;
          document.querySelectorAll("p")[0].innerText = countryInfo.text;
        } else {
          console.log("Country not found");
        }
      })
      .catch(error => console.error('Error loading countries.json:', error));
  }
  