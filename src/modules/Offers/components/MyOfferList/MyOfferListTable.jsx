/**
 * Created by V.Minyailov-book on 22.10.2016.
 */

import React, {Component} from 'react';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
    from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import {Link} from 'react-router';

export default class MyOfferListTable extends Component {

    constructor(props) {
        super(props);
        this.state = {offers : []};
        //this.getMyOffersData = this.getMyOffersData.bind(this);
        this.onOfferMoreButtonClickHandler = this.onOfferMoreButtonClickHandler.bind(this);
    }

    onOfferMoreButtonClickHandler = (e) => {
        console.log(e.target.getAttribute('value'));
    };

    componentWillMount() {
    //getMyOffersData () {
        let self = this;

        let uid = localStorage.getItem('uid');
        let access_token = localStorage.getItem('auth-token');
        console.log(uid + ' - ' + access_token);

        let promise = fetch (
            'http://192.168.1.213:8077/request-loan/user-request/' + uid,
            {
                method: 'GET',
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                credentials: 'include'
            }
        ).then (
            function(response) {
                if (response.status !== 200) {
                    console.log('Status Code: ' + response.status);
                    return;
                }
                response.json().then(function (data) {
                    self.setState({offers: data});
                });
            }
        ).catch(function(err) {
            console.log('Fetch Error: ', err);
        });
    }

    render () {
//        this.getMyOffersData();
        return (
            <Table>
                <TableHeader adjustForCheckbox={false}
                             displaySelectAll={false}
                >
                    <TableRow>
                        <TableHeaderColumn>Сумма</TableHeaderColumn>
                        <TableHeaderColumn>Период</TableHeaderColumn>
                        <TableHeaderColumn>Ставка (%/дн)</TableHeaderColumn>
                        <TableHeaderColumn>Подробности</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {this.state.offers.map((elem, index) => (
                    <TableRow key={index} data-item={elem.ID} onClick={this.onOfferMoreButtonClickHandler}>
                        <TableRowColumn style={{fontSize: 18}}>{elem.LOAN_SUMM}</TableRowColumn>
                        <TableRowColumn style={{fontSize: 18}}>{elem.PERIOD}</TableRowColumn>
                        <TableRowColumn style={{fontSize: 18}}>{elem.RATE}</TableRowColumn>
                        <TableRowColumn>
                            {/*<RaisedButton label="открыть"
                                          secondary={true}
                                          onClick={this.onOfferMoreButtonClickHandler}
                                          value={elem.ID}
                            />*/}
                            <Link to={"/offer/" + elem.ID}>More ...</Link>
                        </TableRowColumn>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }
}
