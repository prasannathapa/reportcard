import { Component } from "react";
import { isMobile } from "react-device-detect";
import { ToastContainer } from "react-toastify";
import colleges, { API_HOST, subCodes } from "../../Database/db";
import SearchBox from "../SearchBox/SearchBox";
import SearchList from "../SearchList/SearchList";
import updateIcon from "../ToggleButton/sync.svg";
import tickIcon from "../ToggleButton/done.svg";
import infoIcon from "../CollegeReport/icons/info.svg";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Fragment } from "react/cjs/react.production.min";

const IDLE = 0;
const DONE = 10;
const FETCHING = 1;
const DONE_SCORE = 2;
const DONE_ALL = 4;
class SubjectReport extends Component {
    constructor(props) {
        super(props);
        this.ItemClickUpdate = this.ItemClickUpdate.bind(this);
        this.searchState = this.searchState.bind(this);
        this.searchTextUpdate = this.searchTextUpdate.bind(this);
        this.getData = this.getData.bind(this);
        this.selectSem = this.selectSem.bind(this);
        this.textFilter = this.textFilter.bind(this);
        let savedState = JSON.parse(localStorage.getItem("subjectData") || "{}");
        if (JSON.stringify(savedState) !== "{}")
            this.state = savedState;
        else
            this.state = { text: "", input: false, semList: [], textFilter: "" }
    }
    ItemClickUpdate(selectedSubject, isSelected) {
        selectedSubject = Object.keys(subCodes)[selectedSubject]
        //console.log(subCodes[selectedSubject], selectedSubject);
        if (isSelected)
            this.setState(() => ({ text: "", selectedSubject: selectedSubject, semList: subCodes[selectedSubject], selectedSem: subCodes[selectedSubject][0] }));
        else
            this.setState(() => ({ text: "", selectedSubject: null, semList: [], fetchState: IDLE }));
    }
    selectSem(e) {
        this.setState({ selectedSem: e.target.value });
    }
    getData() {
        let subCode = this.state.selectedSubject;
        let sem = this.state.selectedSem;
        var urlencoded = new URLSearchParams();
        urlencoded.append("subCode", subCode);
        urlencoded.append("sem", sem);
        this.setState({ fetchState: FETCHING });
        fetch(API_HOST + '/subjectReport', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: urlencoded
        }).then(res => res.json()).then(data => {
            this.setState({ fetchState: DONE_ALL, data: data, text: subCode });
            localStorage.setItem("subjectData", JSON.stringify(this.state));
        });
    }
    textFilter(e) {
        this.setState({ textFilter: e.target.value });
    }
    searchState(isActive) {
        let apiState = this.state.fetchState;
        if (apiState !== FETCHING)
            apiState = IDLE;
        this.setState(() => ({ input: isActive, fetchState: apiState }));
    }
    searchTextUpdate(text) {
        this.setState(() => ({ text: text, fetchState: IDLE }));
    }
    checkTextFilter(text) {
        let containText = true;
        if (this.state.textFilter && this.state.textFilter.length > 0) {
            let filterArray = this.state.textFilter.split(" ");
            for (let filter of filterArray) {
                if (filter.length > 0) {
                    if (text.toLocaleLowerCase().search(filter.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&').toLocaleLowerCase()) == -1) {
                        containText = false;
                        break;
                    }
                }
            }
        }
        return containText;
    }
    boderStyle = { borderRadius: "12px", padding: "16px" };
    render() {
        let resultState;
        switch (this.state.fetchState) {
            case FETCHING:
                resultState = "button active";
                break;
            case DONE_ALL:
            case DONE_SCORE:
                resultState = "button finished";
                break;
            default:
                resultState = "button";
        }
        return (
            <div className="search">
                <ToastContainer />
                {!this.state.selectedSubject &&
                    <SearchBox title={"Enter Subject Code"}
                        color={"#FFFFFF"}
                        colorHint={"#717171"}
                        spacing={(isMobile ? 1 : 2)}
                        maxLength={100}
                        searchTextUpdate={this.searchTextUpdate}
                        text={this.state.text}
                        searchState={this.searchState} dataText={Object.keys(subCodes)}
                        active={this.state.input} />
                }
                <SearchList
                    filterText={this.state.text}
                    list={Object.keys(subCodes)}
                    ItemClickUpdate={this.ItemClickUpdate}
                    maxSelection={1}
                    hideGradient={this.state.fetchState == DONE} />
                {this.state.semList.length > 0 &&
                    <div className="toolbox">
                        <span style={{ display: "inline", margin: "auto 0", fontFamily: "'Open Sans', cursive" }}>Semester</span>
                        <select style={this.boderStyle} onChange={this.selectSem} style={this.boderStyle} value={this.state.selectedSem} disabled={this.state.semList.length == 1}>
                            {this.state.semList.map(sem => {
                                return <option key={sem} value={sem}>{"sem "+sem[3]}</option>
                            })}
                        </select>
                        {this.state.data &&
                            <Fragment>
                                <span>  </span>
                                <span style={{ display: "inline", margin: "auto 40px auto 0", fontFamily: "'Open Sans', cursive" }}>Filter by</span>
                                <input onChange={this.textFilter} style={{ border: "none", minWidth: "50%", borderRadius: "12px", padding: "8px" }}></input>
                            </Fragment>
                        }
                    </div>
                }
                {this.state.selectedSubject &&
                    <div className="toolbox">
                        <button className={resultState} onClick={this.getData}>
                            <span className="submit">Show Data</span>
                            <span className="loading"><img src={updateIcon} alt="" /></span>
                            <span className="check"><img src={tickIcon} alt="" /></span>
                        </button>
                    </div>
                }

                {this.state.data &&
                    <div className="resultbox">
                        {Object.keys(this.state.data).map(college => {
                            return (
                                this.checkTextFilter(colleges[college]) ?
                                    <div key={college} className="gradecard" style={{ width: "auto" }}>
                                        <h3>{colleges[college]}</h3>
                                        {Object.keys(this.state.data[college]).map(batch => {
                                            return (
                                                <div key={batch + college} style={{ display: "block", Height: "400px" }}>
                                                    <span>{"20" + batch}</span>
                                                    <ResponsiveContainer width={360} height={300}>
                                                        <BarChart
                                                            width={500}
                                                            data={this.state.data[college][batch].CGPA_DATA}>
                                                            <XAxis height={60} label={{ value: "CGPA", position: "outsideTopMiddle", dx: 0, dy: 13 }} />
                                                            <YAxis dataKey="" />
                                                            <Bar name="Students" dataKey="count" />
                                                            <Tooltip />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <div className="badge mxw300">
                                                        <img src={infoIcon}></img>
                                                        <p>Average: <bold>{this.state.data[college][batch].AVERAGE_CGPA}</bold><br></br> standard deviation <bold>{this.state.data[college][batch].STANDARD_DEVIATION}</bold> </p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                        }
                                    </div> : null
                            )
                        })
                        }
                    </div>
                }
            </div>
        )
    }
}
export default SubjectReport;
