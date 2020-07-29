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

const styles = () => ({
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
  button: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
  },
  title_container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  main_container: {
    width: "25%",
    "min-width": "fit-content"
  }
});

class Login extends Component {
  constructor() {
    super();

    this.state = {
      nickname: "",
      password: "",
    };
  }
  updateField = (event) => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  };

  loginUser = () => {
    const { nickname, password } = this.state;

    console.log(nickname, password);
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.main_background}>
        <Card className={classes.main_container}>
          <CardContent>
            <h1 className={classes.title_container}>Login</h1>

            <Divider />

            <TextField
              label="Nickname"
              name={"nickname"}
              fullWidth
              onChange={this.updateField}
            />
            <TextField
              label="Password"
              name={"password"}
              fullWidth
              onChange={this.updateField}
              type="Password"
            />
          </CardContent>

          <Divider />

          <CardActions>
            <Button
              fullWidth
              className={classes.button}
              onClick={this.loginUser}
            >
              Submit
            </Button>
          </CardActions>
        </Card>
      </div>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);
