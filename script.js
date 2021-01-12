const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
const displayModePanel = document.querySelector('#display-mode')
const btnDisplayList = document.querySelector('.btn-display-list')
const btnDisplayGrid = document.querySelector('.btn-display-grid')
let currentMode = 'grid'
let currentPage = 1


// 取得API渲染初始畫面
axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieGrid(getMoviesByPage(1))
    btnDisplayGrid.classList.add('active')
  })
  .catch(error => {
    console.log(error)
  })

displayModePanel.addEventListener('click', function onDisplayModeClicked(event) {
  if (event.target.matches('.btn-display-list')) {
    btnDisplayGrid.classList.remove('active')
    currentMode = 'list'
    btnDisplayList.classList.add('active')
    displayMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('.btn-display-grid')) {
    btnDisplayList.classList.remove('active')
    currentMode = 'grid'
    btnDisplayGrid.classList.add('active')
    renderMovieGrid(getMoviesByPage(currentPage))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page
  currentPage = page
  if (currentMode === 'grid') {
    btnDisplayList.classList.remove('active')
    btnDisplayGrid.classList.add('active')
    return renderMovieGrid(getMoviesByPage(currentPage))
  }
  if (currentMode === 'list') {
    btnDisplayGrid.classList.remove('active')
    btnDisplayList.classList.add('active')
    return displayMovieList(getMoviesByPage(currentPage))
  }
})

// 在按鈕上綁監聽器: 1)modal展開電影詳細資料 2)加入最愛清單
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id)) // 傳入參數要是點擊該部的個別ID
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id)) // 傳入參數要是點擊該部的個別ID
  }
})

// 查詢並渲染畫面為符合關鍵字電影
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('請輸入有效字串')
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的字串 ${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieGrid(getMoviesByPage(1))
})

//////////////////////////////// Functions ///////////////////////////
function displayMovieList(data) {
  let listHTML = `<div class="col-sm-12"><ul>`
  data.forEach((item) => {
    listHTML += `
      <li class="row list-group-item d-flex align-bottom" id="list-group-item">
        <div class="list-head col-sm-10">
          <h5 class="list-title">${item.title}</h5>
        </div>
        <div class="list-body col-sm-2">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id = "${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
    `
  })
  listHTML += `</ul></div>`
  dataPanel.innerHTML = listHTML
}

function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const data = filteredMovies.length ? filteredMovies : movies
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class = "page-link" href = "#" data-page = "${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // ||左右為true的才會回傳，如果都為true則優先回傳左邊的
  const movie = movies.find((movie) => movie.id === id) // movie是一個陣列，丟入每一部相符id的movies
  if (list.some((movie) => movie.id === id)) {
    return alert('此部電影已在收藏清單中！')
  }
  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
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

// 用API資料渲染畫面
function renderMovieGrid(data) {
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
    dataPanel.innerHTML = rawHTML
  })
}