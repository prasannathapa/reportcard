import { Component } from "react";
import './search.scss';
import searchIcon from './icon/search.svg';
import Typer from "../Typer/Typer";

class SearchBox extends Component {
    constructor(props) {
        super(props);
        this.inputFocus = this.inputFocus.bind(this);
        this.inputBlur = this.inputBlur.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = { text: "" }
    }
    handleChange(event) {
        this.props.searchTextUpdate(event.target.value);
    }
    inputFocus(e) {
        this.props.searchState(true);
    }
    inputBlur(e) {
        this.props.searchState(false);
    }
    render() {
        return (
            <div className="search">
                {this.props.title && <h3>{this.props.title}</h3>}
                <div className="search-box">
                    <img className="search-logo" alt="search icon" src={searchIcon} />
                    <div className="search-text">
                        <input 
                            type={this.props.type || "text"}
                            style={{ color: this.props.color, letterSpacing:this.props.spacing}}
                            onFocus={this.inputFocus}
                            onBlur={this.inputBlur}
                            value={this.props.text}
                            onChange={this.handleChange}>

                        </input>
                        {!(this.props.active || this.props.text !== "") &&
                            <Typer className="hint" color={this.props.colorHint} dataText={this.props.dataText} maxLength={this.props.maxLength} spacing={this.props.spacing} />
                        }
                    </div>
                </div>
            </div>
        );
    }
}
export default SearchBox;