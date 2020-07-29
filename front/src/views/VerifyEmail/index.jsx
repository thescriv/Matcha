import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import { Button } from '@material-ui/core'
import history from '../../utils/history'
import { verifyEmail } from '../../utils/helper'
import LinearProgress from '@material-ui/core/LinearProgress';


const styles = () => ({
  button: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  },
  main_background: {
    position: 'fixed',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    padding: 0,
    margin: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, #7e22a8 30%, #a751cf 90%)',
  },
})

class VerifyEmail extends Component {
  constructor() {
    super()

    this.state = {
      error: null,
      loading: true,
    }
  }

  componentDidMount = async () => {
    const { id } = this.props.match.params

    try {
        await verifyEmail(id)
      } catch (err) {
        this.setState({ error: err })
      }
  }

  render() {
    const { classes } = this.props
    const { loading } = this.state

    return (
      <div className={classes.main_background}>
        {loading ? <LinearProgress /> : <div> <h2>{error ? error.response.body.error : 'Your account is verified !'}</h2>
        <Button className={classes.button} onClick={() => history.push('/')}>
          Return to home page
        </Button> </div>}
        
      </div>
    )
  }
}

VerifyEmail.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(VerifyEmail)
