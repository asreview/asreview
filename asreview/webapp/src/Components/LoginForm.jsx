import React from "react";
import PropTypes from "prop-types";
import { Formik } from "formik";
import * as Yup from "yup";
import { Redirect } from "react-router-dom";

import "../PreReviewComponents/ReviewZone.css";

const useStyles = makeStyles((theme) => ({
    title: {
        marginBottom: "20px",
    },
    button: {
        margin: "36px 0px 0px 12px",
        float: "right",
    },
    input: {
        display: "none",
    },
    textfieldItem: {
        marginTop: 0,
        marginBottom: 40,
    },
    clear: {
        overflow: "auto",
    },
    editButton: {
        float: "right",
    },
    avatar: {
        color: theme.palette.getContrastText(brown[500]),
        backgroundColor: brown[500],
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
}));

const LoginForm = (props) => {

    const { onClose, open } = props;

    // if (props.isAuthenticated()) {
    //     return <Typography align="center">
    // You are already logged in.
    //      </Typography >;
    // }

    return (
        <div>
            <h1 className="title is-1">Log In</h1>
            <hr />
            <br />
            <Formik
                initialValues={{
                    email: "",
                    password: "",
                }}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    props.handleLoginFormSubmit(values);
                    resetForm();
                    setSubmitting(false);
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string()
                        .email("Enter a valid email.")
                        .required("Email is required."),
                    password: Yup.string().required("Password is required."),
                })}
            >
                {(props) => {
                    const {
                        values,
                        touched,
                        errors,
                        isSubmitting,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                    } = props;
                    return (
                        <form onSubmit={handleSubmit}>
                            <div className="field">
                                <label className="label" htmlFor="input-email">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    id="input-email"
                                    className={
                                        errors.email && touched.email ? "input error" : "input"
                                    }
                                    type="email"
                                    placeholder="Enter an email address"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {errors.email && touched.email && (
                                    <div className="input-feedback">{errors.email}</div>
                                )}
                            </div>
                            <div className="field">
                                <label className="label" htmlFor="input-password">
                                    Password
                                </label>
                                <input
                                    name="password"
                                    id="input-password"
                                    className={
                                        errors.password && touched.password
                                            ? "input error"
                                            : "input"
                                    }
                                    type="password"
                                    placeholder="Enter a password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {errors.password && touched.password && (
                                    <div className="input-feedback">{errors.password}</div>
                                )}
                            </div>
                            <input
                                type="submit"
                                className="button is-primary"
                                value="Submit"
                                disabled={isSubmitting}
                            />
                        </form>
                    );
                }}
            </Formik>
        </div>
    );
};

LoginForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    // handleLoginFormSubmit: PropTypes.func.isRequired,
    // isAuthenticated: PropTypes.func.isRequired,
};

export default LoginForm;
