import React, { Component } from 'react';
import { Header } from '../containers/Header';

export default class Home extends Component {
    render() {
        return (
            <header className="header">
                <Header />
                <h1>Главная</h1>
		    </header>
        );
    }
}
