export default function APIFetcher(url, contentType) {
  return fetch(url)
    .then((res) => {
      if(res.status === 200) {
        return res[contentType]()._value;
      }
      throw `Status code ${res.status} returned from Chembl API 😔`;
    })
    .catch((error) => {
      throw error;
    });
}
