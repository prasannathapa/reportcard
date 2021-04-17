import { Component } from "react";
import './student.scss';
import updateIcon from "../ToggleButton/sync.svg";
import tickIcon from "../ToggleButton/done.svg";
import '../ToggleButton/toggle.scss';
import SearchBox from "../SearchBox/SearchBox";
import { isMobile } from "react-device-detect";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GradeCard from "../GradeCard/GradeCard";
import RatingBar from "../Ratings/Ratings";
import { Area, AreaChart, CartesianGrid, Label, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const sems = ["1st sem", "2nd sem", "3rd sem", "4th sem", "5th sem", "6th sem", "7th sem", "8th sem"]
const IDLE = 0;
const FETCHING = 1;
const DONE_SCORE = 2;
const DONE_ANALYTICS = 3;
const DONE_ALL = 4;
const SHOWING_DATA = 10;
const ERROR = -1;
class Student extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.searchState = this.searchState.bind(this);
        this.searchTextUpdate = this.searchTextUpdate.bind(this);
        this.semsQueryHandler = this.semsQueryHandler.bind(this);
        this.getSingleResult = this.getSingleResult.bind(this);
        this.getPercentileCallback = this.getPercentileCallback.bind(this);
        let text = this.props.text || "";
        let semsState = this.props.sems || {};
        let semResult = this.props.semResult || {};
        if (text !== "")
            this.state = { input: false, text: "", sems: semsState, semResult: semResult, fetchState: IDLE, rating: 0, topSubjects: {}, radarGraph: null };
        else {
            let savedState = JSON.parse(localStorage.getItem('studentState')) ||
                { input: false, text: "", sems: semsState, semResult: {}, fetchState: IDLE, rating: 0, topSubjects: {}, radarGraph: null };
            this.state = savedState;
        }
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidUpdate(prevProps, prevState) {
        //console.log(this.state.fetchState);
        if (this.state.fetchState === DONE_ALL && this.state.semResult.name) {
            let rating = 0, semCount = 0;
            for (let key in this.state.analyticsResult) {
                let analyticsResult = this.state.analyticsResult;
                let semResult = this.state.semResult;
                if (['SM01', 'SM02', 'SM03', 'SM04', 'SM05', 'SM06', 'SM07', 'SM08'].includes(key)) {
                    let myCGPA = parseFloat(semResult.results[key]);
                    let studentBelowMe = 0, totalStudent = 0;
                    semCount++;
                    for (let i = 0; i < analyticsResult[key].length; i++) {
                        let itr = analyticsResult[key][i];
                        if (myCGPA > parseFloat(itr.CGPA))
                            studentBelowMe += itr.count;
                        totalStudent += itr.count;
                    }
                    rating += studentBelowMe / totalStudent;
                }
            }
            rating = (rating / semCount) * 5;
            console.log(rating);
            let myState = this.state;
            myState.rating = rating;
            myState.fetchState = SHOWING_DATA;
            localStorage.setItem('studentState', JSON.stringify(myState));
            toast(this.state.semResult.name + " is in top " + (100 - rating * 20).toFixed(2) + "%", { type: toast.TYPE.INFO });
            this.setState(() => ({ rating: rating, fetchState: SHOWING_DATA }))
        }
        else if (this.state.fetchState === FETCHING && prevState.fetchState !== FETCHING) {
            let semList = "";
            for (const i in this.state.sems)
                if (this.state.sems[i] === true)
                    semList += (1 + parseInt(i)).toString();
            fetch("https://makaut-api.herokuapp.com/" + this.state.text + "/" + semList)
                .then(res => res.json())
                .then(
                    (result) => {
                        if (result.name) {
                            toast("Results arrived", { type: toast.TYPE.SUCCESS });
                            for (let key in result) {
                                if (result[key].info && !isNaN(key[key.length - 1])) {
                                    toast(sems[key[key.length - 1] - 1] + " results not Found!", { type: toast.TYPE.INFO });
                                }
                            }
                        }
                        else
                            toast("Records not Found!", { type: toast.TYPE.ERROR });
                        const STATE = this.state.fetchState === DONE_ANALYTICS ? DONE_ALL : DONE_SCORE;
                        this.setState(() => ({ semResult: result, fetchState: STATE }));
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
            fetch("https://makaut-api.herokuapp.com/analytics/cgpa/" + this.state.text + "/" + semList)
                .then(res => res.json())
                .then(
                    (result) => {
                        const STATE = this.state.fetchState === DONE_SCORE ? DONE_ALL : DONE_ANALYTICS;
                        this.setState(() => ({ analyticsResult: result, fetchState: STATE }));
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
    sortCGPAAnalytics(data) {
        //console.log(data);
        let res = [];
        let min = 1000, max = 0;
        for (let i = 0; i < data.length; i++) {
            let index = parseInt(parseFloat(data[i].CGPA) * 100);
            if (index > max)
                max = index;
            if (min > index)
                min = index;
        }
        //console.log(min,max)
        min = min - 1
        for (let i = min; i <= max; i++) {
            res[i - min] = { CGPA: (i / 100).toFixed(2), students: null }
        }
        for (let i = 0; i < data.length; i++) {
            let index = parseInt(parseFloat(data[i].CGPA) * 100);
            res[index - min] = { CGPA: (index / 100).toFixed(2), students: data[i].count };
        }
        return res;
    }
    getPercentileCallback(obj) {
        let radar = this.state.radarGraph
        if (!radar)
            radar = {}
        radar = Object.assign(radar, obj);
        console.log(radar);
        if (this._isMounted)
            this.setState(() => ({ radarGraph: radar }));
    }
    getSingleResult(e) {
        if (this.state.fetchState !== FETCHING && this._isMounted) {
            this.setState(() => ({ fetchState: FETCHING, rating: 0, topSubjects: {}, semResult: {}, radarGraph: null }));
        }
        else {
            toast("Processing results. Please wait!", { type: toast.TYPE.DARK })
        }
    }
    searchState(isActive) {
        let apiState = this.state.fetchState;
        if (apiState !== FETCHING)
            apiState = IDLE;
        this.setState(() => ({ input: isActive, fetchState: apiState }));
    }
    searchTextUpdate(text) {
        let apiState = this.state.fetchState;
        if (apiState !== FETCHING)
            apiState = IDLE;
        this.setState(() => ({ text: text, fetchState: apiState }));
    }
    semsQueryHandler(e) {
        const data = e.currentTarget.getAttribute("item-id");
        let update = this.state.sems;
        update[data] = !update[data]
        this.setState(() => ({
            sems: update
        }));
    }
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
                <SearchBox
                    title="Search your roll number."
                    type={"number"}
                    color={"#FFFFFF"}
                    colorHint={"#717171"}
                    spacing={(isMobile ? 3 : 8)}
                    searchTextUpdate={this.searchTextUpdate}
                    text={this.state.text}
                    searchState={this.searchState} dataText={[
                        "30000118020",
                        "19600128033",
                        "10000119055",
                        "11600118025",
                        "11700119032",
                    ]}
                    active={this.state.input}
                />
                {(this.state.input || this.state.text) && (this.state.fetchState !== DONE_ALL || this.state.fetchState !== DONE_SCORE) &&
                    <div className="toolbox">
                        {semsBtn}
                    </div>
                }
                {(this.state.text.length >= 11 && this.checkAnySemList()) &&
                    <div className="toolbox" onClick={this.getSingleResult}>
                        <button className={resultState}>
                            <span className="submit">Search</span>
                            <span className="loading"><img src={updateIcon} alt="" /></span>
                            <span className="check"><img src={tickIcon} alt="" /></span>
                        </button>
                    </div>
                }

                {this.state.semResult && this.state.semResult.name &&
                    <header>
                        <span className="title">{this.state.semResult.name}</span>
                        <span className="sub-title">{this.state.semResult.registration}</span>
                    </header>
                }
                {this.state.rating !== 0 && this.state.semResult.name && <RatingBar count={this.state.rating + 1} className='resultbox' />}
                {this.state.semResult && this.state.semResult.name && //false &&
                    <div className="resultbox">
                        {Object.keys(this.state.semResult).map(item => {
                            if (['SM01', 'SM02', 'SM03', 'SM04', 'SM05', 'SM06', 'SM07', 'SM08'].includes(item))
                                return <GradeCard key={item}
                                    percentileCallback={this.getPercentileCallback}
                                    title={"Sem " + item[item.length - 1]}
                                    semData={this.state.semResult[item]}
                                    roll={this.state.semResult.roll}
                                    semNo={item[item.length - 1]}
                                    singleSem={true} />
                            else
                                return null;
                        })}

                    </div>
                }
                {
                    this.state.radarGraph != null &&
                    <div className="resultbox">
                        <header>
                            <span className="title">Subject-wise Percentile Distribution</span>
                            <span className="sub-title">for strong subjects identification  </span>
                        </header>
                        <div className="radarbox-container">
                            {Object.keys(this.state.radarGraph).map(val => (
                                <div className="radarbox" key={val}>
                                    <span className="title" >Semester {val}</span>
                                    <ResponsiveContainer minHeight={300} maxHeight={360} width="32%" minWidth={360} height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={this.state.radarGraph[val]}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subCode" />
                                            <PolarRadiusAxis />
                                            <Tooltip dataKey="subName" />
                                            <Radar name="percentile" dataKey="percentile" stroke="#ffa600" fill="#ffa600" fillOpacity={0.6} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                {this.state.fetchState === SHOWING_DATA && !this.state.analyticsResult.info &&
                    <div className="resultbox">
                        <header>
                            <span className="title">Semester analytics</span>
                            <span className="sub-title">Marks distrubition per semester of all students (past and current) on the same course</span>
                        </header>
                        {
                            Object.keys(this.state.analyticsResult).map(key => {
                                if (['SM01', 'SM02', 'SM03', 'SM04', 'SM05', 'SM06', 'SM07', 'SM08'].includes(key)) {
                                    return (
                                        <ResponsiveContainer key={key} minHeight={380} width="90%" height="100%">
                                            <AreaChart zoomAndPan="true"
                                                data={this.sortCGPAAnalytics(this.state.analyticsResult[key])}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis height={40} dataKey="CGPA" label={{ value: "Semester " + key[key.length - 1] + " CGPA", position: "outsideTopMiddle", dx: 0, dy: 13 }} />
                                                <YAxis label={{ value: "Students Count", position: "outsideMiddle", angle: -90, dx: -20 }} />
                                                <Tooltip />
                                                <ReferenceLine x={this.state.semResult.results[key]} stroke="black" strokeWidth="4px"
                                                    label={<Label position="insideRight" value={this.state.semResult.name} />}
                                                />
                                                <Area connectNulls={true} type="monotone" dataKey="students" fill="#ffa600" stroke="#ffa600" />
                                            </AreaChart >
                                        </ResponsiveContainer>
                                    )
                                }
                                else
                                    return null;
                            })
                        }
                        {//<GradeCard title={this.state.semResult.name} semData={this.state.semResult} singleSem={false} />
                        }
                    </div>
                }
                {this.state.semResult && this.state.semResult.name &&
                    <footer>
                        <span>{this.state.semResult.collegeName}</span>
                    </footer>
                }
            </div>
        );
    }
    checkAnySemList() {
        for (const i in this.state.sems)
            if (this.state.sems[i] === true)
                return true;
        return false;
    }
}
export default Student;