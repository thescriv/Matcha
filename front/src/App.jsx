import React, { Component } from 'react'
import { Router } from 'react-router-dom'

import Routes from './Routes'
import history from './utils/history'

class App extends Component {
  render() {
    return (
      <Router history={history} >
        <Routes />
      </Router>
    )
  }
}

export default App
