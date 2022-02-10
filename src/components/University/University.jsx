import { Component } from "react";
import { isMobile } from "react-device-detect";
import { toast, ToastContainer } from "react-toastify";
import SearchBox from "../SearchBox/SearchBox";
import updateIcon from "../ToggleButton/sync.svg";
import tickIcon from "../ToggleButton/done.svg";
import GradeCard from "../GradeCard/GradeCard";
import "./university.scss";
import { API_HOST } from "../../Database/db";
const IDLE = 0;
const DONE = 10;
const FETCHING = 1;
const ERROR = -1;
const sems = ["1st sem", "2nd sem", "3rd sem", "4th sem", "5th sem", "6th sem", "7th sem", "8th sem"]

class University extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.searchTextUpdate1 = this.searchTextUpdate1.bind(this);
        this.searchTextUpdate2 = this.searchTextUpdate2.bind(this);
        this.semsQueryHandler = this.semsQueryHandler.bind(this);
        this.getRangeResult = this.getRangeResult.bind(this);
        this.searchState = this.searchState.bind(this);
        this.sortFilter = this.sortFilter.bind(this);
        this.sortProp = this.sortProp.bind(this);
        this.textFilter = this.textFilter.bind(this);
        let savedState = JSON.parse(localStorage.getItem('MultiStudentState')) ||
            { input: false, text1: "", text2: "", sems: {}, fetchState: IDLE, semResult: {}, sortBy: 0, sort: 1 };
        this.state = savedState;
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    getRangeResult(e) {
        if (this.state.fetchState !== FETCHING && this._isMounted) {
            this.setState(() => ({ fetchState: FETCHING, semResult: {} }));
        }
        else {
            toast("Processing results. Please wait!", { type: toast.TYPE.DARK })
        }
    }
    sortedObj(jsonObj, sort) {
        return Object.keys(jsonObj).sort((a, b) => {
            a = parseInt(a)
            b = parseInt(b)
            if (sort == 1)
                return a < b ? -1 : a > b ? 1 : 0;
            return a > b ? -1 : a < b ? 1 : 0;
        }).reduce((obj, key) => {
            obj[key] = jsonObj[key];
            return obj;
        }, {});
    }
    sortSems(semResult, sortBy, sort) {
        let obj = [];
        console.log(sortBy, sort);
        for (let i in semResult)
            obj.push(semResult[i]);
        if (sortBy >= 0) {
            obj.sort((a, b) => {
                let prop = ["SM01", "SM02", "SM03", "SM04", "SM05", "SM06", "SM07", "SM08"]
                let ar = a.results || {};
                let br = b.results || {};
                let x = ar[prop[sortBy]]
                let y = br[prop[sortBy]]
                if (!x) x = 999 * sort;
                if (!y) y = 999 * sort;
                if (x > y) {
                    return sort == 1 ? 1 : -1;
                }
                else if (x < y)
                    return sort == 1 ? -1 : 1;
                else
                    return 0;
            });
            console.log(obj)
            let sR = {};
            for (let data of obj)
                sR[data.roll] = data;
            semResult = sR;
        }
        else if (sortBy == -1) {
            semResult = this.sortedObj(semResult, sort);
        }
        else if (sortBy == -2) {
            obj.sort((a, b) => {

                let sems_cgpa = Object.values(a.results || {});
                let x = sems_cgpa.reduce((acc, v, i, xa) => (acc + v / xa.length), 0);
                sems_cgpa = Object.values(b.results || {});
                let y = sems_cgpa.reduce((acc, v, i, xa) => (acc + v / xa.length), 0);
                if (!x) x = 999 * sort;
                if (!y) y = 999 * sort;
                if (x > y) {
                    return sort == 1 ? 1 : -1;
                }
                else if (x < y)
                    return sort == 1 ? -1 : 1;
                else
                    return 0;
            });
            let sR = {};
            for (let data of obj)
                sR[data.roll] = data;
            semResult = sR;
        }
        else if (sortBy == -3) {
            obj.sort((a, b) => {
                if (a.name > b.name) {
                    return sort == 1 ? 1 : -1;
                }
                else if (a.name < b.name)
                    return sort == 1 ? -1 : 1;
                else
                    return 0;
            });
            let sR = {};
            for (let data of obj)
                sR[data.roll] = data;
            semResult = sR;
        }
        this.setState(() => ({ semResult: semResult, fetchState: DONE, sort: sort, sortBy: sortBy }));
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.fetchState === DONE) {
            localStorage.setItem('MultiStudentState', JSON.stringify(this.state));
            //this.setState(() => ({ fetchState: IDLE }));
        }
        if (this.state.fetchState === FETCHING && prevState.fetchState !== FETCHING) {
            let semList = "";
            for (const i in this.state.sems)
                if (this.state.sems[i] === true)
                    semList += (1 + parseInt(i)).toString();
            fetch(API_HOST + "/" + this.state.text1 + "/" + this.state.text2 + "/" + semList)
                .then(res => res.json())
                .then(
                    (result) => {
                        toast("Results arrived", { type: toast.TYPE.SUCCESS });
                        for (let roll in result) {
                            if (!result[roll].name) {
                                toast("Records of " + roll + " not Found!", { type: toast.TYPE.INFO });
                            }
                        }
                        //const STATE = this.state.fetchState === DONE_ANALYTICS ? DONE_ALL : DONE_SCORE;
                        this.sortSems(result, this.state.sortBy, this.state.sort)
                        //console.log(result);
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        toast("Something went wrong", { type: toast.TYPE.ERROR })
                        this.setState(() => ({ fetchState: ERROR }));
                        console.log(error);
                    }
                )
        }
    }
    semsQueryHandler(e) {
        const data = e.currentTarget.getAttribute("item-id");
        let update = this.state.sems;
        update[data] = !update[data]
        this.setState(() => ({
            sems: update
        }));
    }
    searchState(isActive) {
        let apiState = this.state.fetchState;
        if (apiState !== FETCHING)
            apiState = IDLE;
        this.setState(() => ({ input: isActive, fetchState: apiState }));
    }
    searchTextUpdate1(text) {
        if (text.length <= 8)
            this.setState(() => ({ text1: text, text2: text }));
        else
            this.setState(() => ({ text1: text }));
    }
    searchTextUpdate2(text) {

        if (this.state.text1.length == 11 && text.length == 11) {
            if (parseInt(text) - parseInt(this.state.text1) > 120)
                toast("Please give range lower then 120 students", { type: toast.TYPE.DARK })
        }
        this.setState(() => ({ text2: text }));
    }
    sortFilter(e) {
        this.sortSems(this.state.semResult, this.state.sortBy, e.target.value)
    }
    sortProp(e) {
        this.sortSems(this.state.semResult, e.target.value, this.state.sort)
    }
    textFilter(e) {
        this.setState(() => ({ textFilter: e.target.value }));
    }
    checkTextFilter(grade) {
        let containText = true;
        if (this.state.textFilter && this.state.textFilter.length > 0) {
            let filterArray = this.state.textFilter.split(" ");
            for (let filter of filterArray) {
                if (filter.length > 0) {
                    if (JSON.stringify(grade).toLocaleLowerCase().search(filter.toLocaleLowerCase()) == -1) {
                        containText = false;
                        break;
                    }
                }
            }
        }
        return grade.name && containText;
    }
    boderStyle = { borderRadius: "12px", padding: "16px" };
    render() {
        const semsBtn = sems.map((item, index) =>
            <button key={index} className={(this.state.sems[index]) ? "toggle on" : "toggle off"} onClick={this.semsQueryHandler} item-id={index}>
                {item}
            </button>
        );
        let resultState;
        switch (this.state.fetchState) {
            case FETCHING:
                resultState = "button active";
                break;
            case DONE:
                resultState = "button finished";
                break;
            default:
                resultState = "button";
        }
        return (
            <div className="search">
                <ToastContainer />
                <SearchBox title="Enter begining ending roll number"
                    color={"#FFFFFF"}
                    colorHint={"#717171"}
                    spacing={(isMobile ? 3 : 8)}
                    maxLength={11}
                    searchTextUpdate={this.searchTextUpdate1}
                    text={this.state.text1}
                    searchState={this.searchState} dataText={["16900218001...", "30000118007...."]}
                    active={this.state.input} />
                <SearchBox
                    title={false}
                    color={"#FFFFFF"}
                    colorHint={"#717171"}
                    spacing={(isMobile ? 3 : 8)}
                    maxLength={11}
                    searchTextUpdate={this.searchTextUpdate2}
                    text={this.state.text2}
                    searchState={this.searchState} dataText={["16900218001...", "30000118060...."]}
                    active={this.state.input} />
                {this.state.text1 && this.state.text2 && this.state.fetchState !== DONE &&
                    <div className="toolbox">
                        {semsBtn}
                    </div>
                }
                {this.checkAnySemList() &&
                    <div className="toolbox" onClick={this.getRangeResult}>
                        <button className={resultState}>
                            <span className="submit">Search</span>
                            <span className="loading"><img src={updateIcon} alt="" /></span>
                            <span className="check"><img src={tickIcon} alt="" /></span>
                        </button>
                    </div>
                }
                {this.state.fetchState !== FETCHING && Object.keys(this.state.semResult).length > 0 &&
                    <div className="toolbox">
                        <span style={{ display: "inline", margin: "auto 0", fontFamily: "'Open Sans', cursive" }}>Sort by</span>
                        <select style={this.boderStyle} value={this.state.sortBy} onChange={this.sortProp}>
                            <option value={-1}>Roll number</option>
                            <option value={-3}>Name</option>
                            <option value={-2}>Average CGPA</option>
                            {Object.keys(this.state.sems).map(i => {
                                if (this.state.sems[i] === true)
                                    return (<option key={i} value={i}>{sems[i]}</option>)
                                return null;
                            }
                            )}
                        </select>
                        <select style={this.boderStyle} value={this.state.sort} onChange={this.sortFilter}>
                            <option value={1} >Ascending</option>
                            <option value={-1} >Descending</option>
                        </select>
                    </div>
                }
                {this.state.fetchState !== FETCHING && Object.keys(this.state.semResult).length > 0 &&
                    <div className="toolbox">
                        <span style={{ display: "inline", margin: "auto 40px auto 0", fontFamily: "'Open Sans', cursive" }}>Filter by</span>
                        <input onChange={this.textFilter} style={{ border: "none", minWidth: "50%", borderRadius: "12px", padding: "16px" }}></input>
                    </div>
                }
                {this.state.semResult &&
                    <div className="resultbox">
                        {Object.keys(this.state.semResult).map(roll => {
                            if (this.checkTextFilter(this.state.semResult[roll]))
                                return <GradeCard key={roll}
                                    title={this.state.semResult[roll].name}
                                    semData={this.state.semResult[roll]}
                                    roll={roll}
                                    singleSem={false} />
                            else
                                return null;
                        })}

                    </div>
                }
            </div>
        );
    }
    checkAnySemList() {
        if (this.state.text1.length == 11 && this.state.text2.length == 11) {
            if (parseInt(this.state.text2) - parseInt(this.state.text1) > 120)
                return false;
        }
        for (const i in this.state.sems)
            if (this.state.sems[i] === true)
                return true;
        return false;
    }
}
export default University;