import SearchContext from '../shared/searchContext'
import '../styles/globals.css'

function App({ Component, pageProps }) {
  return (
    <SearchContext>
      <Component {...pageProps} />
    </SearchContext>
  )
}

export default App
