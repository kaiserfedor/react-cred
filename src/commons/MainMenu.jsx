/**
 * Created by V.Minyailov-book on 29.09.2016.
 */
import React, { Component } from 'react';
import { Link } from  'react-router';
import Paper from 'material-ui/Paper';

export default class MainMenu extends Component {
    render() {
        return (
            <div className="wrapper clearfix">
                <Paper>
                    <ul className="top-menu elem3 clearfix">
                        {/*<li className="">
                            <Link to="/test">Тестовая</Link>
                        </li>*/}
                        <li className="">
                            <Link to="/">Главная</Link>
                        </li>
                        <li className="">
                            <Link to="/about">О проекте</Link>
                        </li>
                        <li className="">
                            <Link to="/faq">Вопрос-Ответ</Link>
                        </li>
                    </ul>
                </Paper>
            </div>
        );
    }
}
