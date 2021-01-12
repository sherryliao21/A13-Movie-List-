const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) // 直接取用local storage裡面的東西，記得用JSON.parse把資料從string轉回js object
const dataPanel = document.querySelector('#data-panel')

// 在按鈕上綁監聽器: 1)modal展開電影詳細資料 2)刪除最愛
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id)) // 傳入參數要是點擊該部的個別ID
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id)) // 傳入參數要是點擊該部的個別ID
  }
})

function removeFromFavorite(id) {
  // 如果movies裡面沒東西就結束函式
  if (!movies) return
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return // 如果找不到的話就結束函式 (findIndex回傳-1代表找不到)
  movies.splice(movieIndex, 1) // 從回傳的index開始，刪一個(就是index那一個)
  // 把更新過後的movies存進localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  // 重新渲染頁面為最新清單
  renderMovieList(movies)
}


// 串接電影詳細資料API
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `<img
                src="${POSTER_URL + data.image}"
                alt="movie-poster" class="img-fluid">`
      modalDate.innerText = 'Release date :' + data.release_date
      modalDescription.innerText = data.description

    })
    .catch((error) => {
      console.log(error)
    })
}

renderMovieList(movies)

// 用API資料渲染畫面
function renderMovieList(data) {
  let rawHTML = '' // 一定要設新變數，否則用API movies資料直接傳的話，函式無法重複利用
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id = "${item.id}">
                More
              </button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
    dataPanel.innerHTML = rawHTML
  })
}

