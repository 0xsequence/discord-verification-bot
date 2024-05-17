'use client';
import React from 'react';
import styles from './LoginButton.module.css';
import PropTypes from 'prop-types';

LoginButton.propTypes = {
    handleOnClick: PropTypes.func.isRequired,
};

export default function LoginButton({ handleOnClick }: any) {
    return (
        <a>
            <button
                type="button"
                onClick={handleOnClick}
                className={
                    'btn h-16 text-black bg-green focus:ring focus:outline-none w-full uppercase font-bold tracking-widest ' +
                    styles.corners
                }
            >
                Connect
            </button>
        </a>
    );
}
