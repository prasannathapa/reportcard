import { Component } from "react";
import { isMobile } from "react-device-detect";
import colleges from "../../Database/db";
import SearchBox from "../SearchBox/SearchBox";
class University extends Component {
    constructor(props) {
        super(props);
        this.searchTextUpdate1 = this.searchTextUpdate1.bind(this);
        this.searchTextUpdate2 = this.searchTextUpdate2.bind(this);
        this.searchState = this.searchState.bind(this);
        this.state = { input: false, text1:"", text2:"" };  
    }
    searchState(isActive) {
        this.setState(() => ({ input: isActive}));
    }
    searchTextUpdate1(text) {
        if(text.length <= 8)
            this.setState(() => ({ text1: text, text2: text}));
        else            
            this.setState(() => ({ text1: text}));  
    }
    searchTextUpdate2(text) {
        this.setState(() => ({ text2: text}));
    }

    render() {
        return (
            <div className="search">
                <SearchBox title="Enter begining ending roll number"
                    color={"#FFFFFF"}
                    colorHint={"#717171"}
                    maxLength={isMobile?13:25}
                    searchTextUpdate={this.searchTextUpdate1}
                    text={this.state.text1}
                    searchState={this.searchState} dataText={["16900218001...", "30000118007...."]}
                    active={this.state.input} />
                 <SearchBox
                    title={false}
                    color={"#FFFFFF"}
                    colorHint={"#717171"}
                    maxLength={isMobile?13:25}
                    searchTextUpdate={this.searchTextUpdate2}
                    text={this.state.text2}
                    searchState={this.searchState} dataText={["16900218001...", "30000118060...."]}
                    active={this.state.input} />
                {this.state.input && <div className="toolbox">hello</div>}
            </div>
        );
    }
}
export default University;