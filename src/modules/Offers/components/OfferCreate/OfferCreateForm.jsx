/**
 * Created by V.Minyailov-book on 17.10.2016.
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import AmountInput from '../inputs/AmountlInput';
import PeriodInput from '../inputs/PeriodlInput';
import RateInput from '../inputs/RateInput';
import DelimiterCheck from '../inputs/DelimiterCheck';

import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Checkbox from 'material-ui/Checkbox';
import * as OfferCreateActions from './OfferCreateActions';
import AuthUtils from '../../../../utils/AuthUtils';


class OfferCreateForm extends Component {
    constructor(props) {
        super(props);
        this.onOfferCreateButtonClickHandler = this.onOfferCreateButtonClickHandler.bind(this);
    }

    onOfferCreateButtonClickHandler() {
        let {amount, period, rate, delimiter} = this.props.form;
        let offerType = this.props.type;

        var body =
            'uid='     + encodeURIComponent(localStorage.getItem('uid')) +
            '&type='   + encodeURIComponent(this.props.type)  +
            '&amount=' + encodeURIComponent(amount.value) +
            '&period=' + encodeURIComponent(period.value) +
            '&rate='   + encodeURIComponent(rate.value) +
            '&delimiter=false';

        console.log(body);

        let promise = fetch (
            'http://192.168.1.213:8077/request-loan/add-request',
            {
                method: 'POST',
                body: body,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            }
        ).then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Status Code: ' +
                        response.status);
                    return;
                }
                response.json().then(function (data) {
                    if (data.status == "OK") {
                        alert ("Заявка создана!");
                        browserHistory.push('/offers/'+ offerType +'/my');
                    }
                });
            }
        ).catch(function(err) {
            console.log('Fetch Error: ', err);
        });
    }

    render() {
        let {amount, period, rate, offerType, delimiter} = this.props.form;

        if(this.props.amount !== undefined) {
            amount.value = this.props.amount;
            period.value = this.props.period;
            rate.value = this.props.rate;
        }

        return (

            <form method="post" id="data" className="validatable">
                <input type="hidden" name="agreementSigned" value="true" />
                <input type="hidden" name="leadId" value="0" />
                <div className="row">
                    <div className="col-xs-5">
                        <AmountInput
                            value={amount.value}
                            valid={amount.valid}
                            dirty={amount.dirty}
                            errors={amount.errors}
                            onChange={this.props.actions.setAmount}
                        />
                    </div>
                    <div className="col-xs-5">
                        <PeriodInput
                            value={period.value}
                            valid={period.valid}
                            dirty={period.dirty}
                            errors={period.errors}
                            onChange={this.props.actions.setPeriod}
                        />
                    </div>
                    <div className="col-xs-4">
                        <RateInput
                            value={rate.value}
                            valid={rate.valid}
                            dirty={rate.dirty}
                            errors={rate.errors}
                            onChange={this.props.actions.setRate}
                        />
                    </div>
                </div>
                <div className="row separator-top"></div>
                <div className="row">
                    <div className="col-xs-7">
                        <Checkbox
                            label="Возможно дробление заявки"
                            value={delimiter.value}
                            onCheck={this.props.actions.setDelimiter}
                            disabled={true}
                        />
                    </div>
                    <div className="col-xs-7">
                        <RadioButtonGroup name="offerType"
                                          defaultSelected={this.props.type}
                                          onChange={this.props.actions.setOfferType}
                                          valid={offerType.valid}
                                          dirty={offerType.dirty}
                                          errors={offerType.errors}
                                          valueSelected={this.props.type}
                        >
                            <RadioButton
                                value="borrow"
                                label="Заявка на заем"
                            />
                            <RadioButton
                                value="lend"
                                label="Заявка на размещение"
                            />
                        </RadioButtonGroup>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xs-offset-7 col-xs-8 button-container">
                        <RaisedButton
                            label="Создать заявку"
                            onClick={this.onOfferCreateButtonClickHandler}
                            secondary={true}
                            disabled={false}
                        />
                    </div>
                    <div className="col-xs-4"></div>
                </div>
            </form>
        )
    }
}

function mapStateToProps(state) {
    return {
        form: state.forms.offerCreate,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(OfferCreateActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OfferCreateForm);