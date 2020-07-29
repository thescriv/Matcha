import React, { Component } from 'react'
import { Router, Switch, Route } from 'react-router-dom'

import history from './utils/history'

import Home from './views/Home'
import Login from './views/Login'
import Unknown from './views/Unknown'
import Register from './views/Register'
import VerifyEmail from './views/VerifyEmail'

class Routes extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/login' component={Login} />
          <Route path='/Register' component={Register} />
          <Route path='/verify-email/:id' component={VerifyEmail} />
          <Route component={Unknown} />
        </Switch>
      </Router>
    )
  }
}

export default Routes
