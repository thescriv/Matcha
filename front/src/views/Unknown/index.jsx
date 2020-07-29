import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Divider,
  TextField,
} from "@material-ui/core";

import history from "../../utils/history";

const styles = () => ({
  button: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
    margin: '5%'
  },
  main_background: {
    position: "fixed",
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    padding: 0,
    margin: 0,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(45deg, #7e22a8 30%, #a751cf 90%)",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

class Unknown extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.main_background}>
        <Card>
          <CardContent>
            <div className={classes.container}>
              <h3> {"< 404 />"}</h3>
            </div>
          </CardContent>

          <Divider />

          <CardContent>
            <div className={classes.container}>
              <h3>Nothing to see here, sorry</h3>
            </div>
          </CardContent>

          <Divider />

          <CardActions>
            <Button
              className={classes.button}
              fullWidth
              onClick={() => history.push("/")}
            >
              Go to Home Page
            </Button>
          </CardActions>
        </Card>
      </div>
    );
  }
}

Unknown.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Unknown);
