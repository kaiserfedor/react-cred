/**
 * Created by V.Minyailov-book on 22.10.2016.
 */

import React, { Component } from 'react';
import TestContent from './components/TestContent';

export default class TestPage extends Component {
    render() {
        return (
            <div>
                <div className="wrapper clearfix">
                    <div className="row">
                        <div className="col-xs-14">
                            <h1 style={{paddingTop:10, paddingBottom: 10}}>Тестовая для просмотра страниц</h1>
                        </div>
                    </div>
                </div>
                <TestContent />
            </div>
        );
    }
}
