import React, { Component, Fragment } from "react";
import SearchBox from "../SearchBox/SearchBox";
import { isMobile } from "react-device-detect";
import { toast, ToastContainer } from "react-toastify";
import colleges, { API_HOST, course_code } from "../../Database/db";
import './CollegeReport.scss'
import SearchList from "../SearchList/SearchList";
import '../Student/student.scss';
import updateIcon from "../ToggleButton/sync.svg";
import tickIcon from "../ToggleButton/done.svg";
import infoIcon from "./icons/info.svg";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Label, Legend, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
const IDLE = 0;
const DONE = 10;
const FETCHING = 1;
const ERROR = -1;
const DONE_SCORE = 2;
const DONE_ANALYTICS = 3;
const DONE_ALL = 4;
const SHOWING_DATA = 10;
class CollegeReport extends Component {
    constructor(props) {
        super(props);
        this.searchTextUpdate = this.searchTextUpdate.bind(this);
        this.searchState = this.searchState.bind(this);
        this.selectYear = this.selectYear.bind(this);
        this.selectCourse = this.selectCourse.bind(this);
        this.ItemClickUpdate = this.ItemClickUpdate.bind(this);
        this.getCollegeResult = this.getCollegeResult.bind(this);
        let savedState = { input: false, text: "", fetchState: IDLE, collegeCode1: -1, collegeCode2: -1 };
        this.state = savedState;
    }
    generateStandardDeviationReport(data) {
        let sd_report = {};
        const sd_low_thres = 0.7;
        const sd_high_thres = 1.8;
        const cgpa_low_thres = 5.8;
        const cgpa_high_thres = 7.5;
        const insuff_data_thres = 7;
        for (const batch in data.data) {
            for (const Subject in data.data[batch]) {
                let lowDeviationHighMarks = "";
                let lowDeviationLowMarks = "";
                let highDeviation = "";
                let lessdata = "";
                for (const sem in data.data[batch][Subject]) {
                    for (const subjectData of data.data[batch][Subject][sem]) {
                        if (subjectData.pass + subjectData.fail < insuff_data_thres) {
                            lessdata += (data.subjectMap[subjectData.code] || subjectData.code) + ", ";
                        }
                        else if (subjectData.standardDeviation < sd_low_thres) {
                            if (subjectData.averageCGPA >= cgpa_high_thres) {
                                lowDeviationHighMarks += (data.subjectMap[subjectData.code] || subjectData.code) + ", ";
                            } else if (subjectData.averageCGPA <= cgpa_low_thres) {
                                lowDeviationLowMarks += (data.subjectMap[subjectData.code] || subjectData.code) + ", ";
                            }
                        }
                        else if (subjectData.standardDeviation > sd_high_thres) {
                            highDeviation += (data.subjectMap[subjectData.code] || subjectData.code) + ", ";
                        }
                    }

                    lowDeviationHighMarks = lowDeviationHighMarks.slice(0, -2).trim();
                    lowDeviationLowMarks = lowDeviationLowMarks.slice(0, -2).trim();
                    highDeviation = highDeviation.slice(0, -2).trim();
                    lessdata = lessdata.slice(0, -2).trim();
                    let a, b, c, d;
                    if (lowDeviationHighMarks.length > 1) {
                        a = <Fragment>
                            The subjects: <bold>{lowDeviationHighMarks}</bold> seems to have very low standard deviation (less than {sd_low_thres} ) with high class average (more than {cgpa_high_thres} ).
                            This indicates the posibility of question paper being too easy or possible security compromise in exam halls. <br></br>
                        </Fragment>
                    }
                    if (lowDeviationLowMarks.length > 1) {
                        b = <Fragment>
                            The data shows that the entire batch is not performing well in <bold>{lowDeviationLowMarks}</bold>
                            as it has very low standard deviation (less than {sd_low_thres} ) with low class average (less than {cgpa_low_thres} ). The reason can be uncovered syllabus by the organisation, question paper with out of syllabus questions or an excessively lengthy question paper.<br></br>
                        </Fragment>
                    }
                    if (highDeviation.length > 1) {
                        c = <Fragment>
                            Students having <bold>{highDeviation}</bold>
                            has a very much dispersed performance than normal (these subjects had a standard deviation of more than  {sd_high_thres} ) wich might be caused by lack of communication of students with teaching faculty or most students is being mostly not present in the lectures.<br></br>
                        </Fragment>

                    }
                    if (lessdata.length > 1) {
                        d = <Fragment>
                            Note: conclusions on <bold>{lessdata}</bold> have been ignored due to less data available
                        </Fragment>
                    }
                    data.studentCount[batch][Subject][sem].report = <p>{a}{b}{c}{d}</p>;
                }
            }
        }
        return data;
    }
    searchState(isActive) {
        let apiState = this.state.fetchState;
        if (apiState !== FETCHING)
            apiState = IDLE;
        this.setState(() => ({ input: isActive, fetchState: apiState }));
    }
    searchTextUpdate(text) {
        this.setState(() => ({ text: text }));
    }
    ItemClickUpdate(id, isActive) {
        let cc1 = this.state.collegeCode1;
        let cc2 = this.state.collegeCode2;
        if (isActive) {
            if (cc1 == -1)
                cc1 = id;
            else
                cc2 = id;
        } else {
            if (cc1 == id) {
                cc1 = cc2;
                cc2 = -1;
            }
            else
                cc2 = -1;
        }
        this.setState({ collegeCode1: cc1, collegeCode2: cc2, text: "", data1: null, fetchState: IDLE });
    }
    isCollegeCompare() {
        return (this.state.collegeCode1 != -1 && this.state.collegeCode2 != -1);
    }
    getCollegeResult() {
        this.setState({ fetchState: FETCHING })
        let cc1 = this.state.collegeCode1;
        let cc2 = this.state.collegeCode2;
        if (cc2 == -1 && cc1 != -1) {
            fetch(API_HOST + "/analytics/college/" + cc1)
                .then(res => res.json())
                .then((result) => {
                    result = this.generateStandardDeviationReport(result);
                    let selectedYear = Object.keys(result.data)[0];
                    this.setState({
                        data1: result, fetchState: DONE,
                        selectedYear: selectedYear,
                        selectedCourse: Object.keys(result.data[selectedYear])[0]
                    });
                });
        }
    }
    selectYear(e) {
        let result = this.state.data1;
        let yr = e.target.value;
        this.setState({ selectedYear: yr, selectedCourse: Object.keys(result.data[yr])[0] })
    }
    selectCourse(e) {
        this.setState({ selectedCourse: e.target.value });
    }
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
        let titleMsgSrchBox = (this.state.collegeCode1 != -1) ?
            "Compare with other instition or get solo report" : "Enter College name or College Code";
        const RADIAN = Math.PI / 180;
        const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            return (
                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
            );
        };
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#F652A0', '#4C5270', '#36EEE0', '#B13EC1', '#ffbc75'];
        return (
            <div className="search">
                <ToastContainer />
                {this.isCollegeCompare() &&
                    <h2>College Comparision</h2>
                }
                {!this.isCollegeCompare() && this.state.fetchState == IDLE &&
                    <SearchBox title={titleMsgSrchBox}
                        color={"#FFFFFF"}
                        colorHint={"#717171"}
                        spacing={(isMobile ? 1 : 2)}
                        maxLength={100}
                        searchTextUpdate={this.searchTextUpdate}
                        text={this.state.text}
                        searchState={this.searchState} dataText={Object.values(colleges)}
                        active={this.state.input} />
                }
                <SearchList
                    filterText={this.state.text}
                    list={colleges}
                    ItemClickUpdate={this.ItemClickUpdate}
                    maxSelection={2}
                    hideGradient={this.state.fetchState == DONE}
                    maxLimitReachMsg={"You can only select 2 colleges at maximun to compare"} />

                {this.state.collegeCode1 != -1 && this.state.fetchState != DONE &&
                    <div className="toolbox" onClick={this.getCollegeResult}>
                        <button className={resultState}>
                            <span className="submit">show stats</span>
                            <span className="loading"><img src={updateIcon} alt="" /></span>
                            <span className="check"><img src={tickIcon} alt="" /></span>
                        </button>
                    </div>
                }
                {this.state.data1 && !this.state.data2 &&
                    <div className="resultbox">
                        <span style={{ display: "inline", margin: "auto 10px auto 0", fontFamily: "'Open Sans', cursive" }}>Filter Subject</span>
                        <select value={this.state.selectedCourse} onChange={this.selectCourse}>
                            {Object.keys(this.state.data1.data[this.state.selectedYear]).map(k => {
                                return (<option key={k} value={k}>{course_code[k]}</option>)
                            })
                            }
                        </select>
                        <span style={{ display: "inline", margin: "auto 0", fontFamily: "'Open Sans', cursive" }}>batch of</span>
                        <select value={this.state.selectedYear} onChange={this.selectYear}>
                            {Object.keys(this.state.data1.data).map(i => {
                                return (<option key={i} value={i}>{i}</option>)
                            })
                            }
                        </select>
                    </div>
                }
                {this.state.data1 && !this.state.data2 &&
                    <div className="resultbox">
                        {Object.keys(this.state.data1.data[this.state.selectedYear][this.state.selectedCourse]).map(key => {
                            if (['SM01', 'SM02', 'SM03', 'SM04', 'SM05', 'SM06', 'SM07', 'SM08'].includes(key)) {
                                return (
                                    <div className="resultbox">
                                        <h3>Semester {key[3]} data</h3>
                                        <header>
                                            <div style={{ display: "block", Height: "400px", minWidth: "60vw" }}>
                                                <div className="resultbox" style={{ flex: "1", minWidth: "360px", display: "block" }}>
                                                    <ResponsiveContainer key={key + "graph1"} minHeight={380} width="90%" height={400}>
                                                        <BarChart width={isMobile ? 330 : 550} height={250} data={this.state.data1.data[this.state.selectedYear][this.state.selectedCourse][key]}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="code" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="pass" fill="#82ca9d" />
                                                            <Bar dataKey="fail" fill="#ff1d1d" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <ResponsiveContainer key={key + "graph2"} minHeight={380} width="90%" height={400}>
                                                        <BarChart width={isMobile ? 330 : 550} height={250} data={this.state.data1.data[this.state.selectedYear][this.state.selectedCourse][key]}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="code" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="lowestCGPA" fill="#ff1d1d" />
                                                            <Bar dataKey="averageCGPA" fill="#8884d8" />
                                                            <Bar dataKey="highestCGPA" fill="#82ca9d" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </header>
                                        <header>
                                            <div className="resultbox" style={{ flex: "1", minWidth: "360px", display: "block" }}>
                                                <div className="badge mxw300">
                                                    <img src={infoIcon}></img>
                                                    <p>Data based on <bold>{this.state.data1.studentCount[this.state.selectedYear][this.state.selectedCourse][key].total}</bold> students in rolled in {course_code[this.state.selectedCourse]} of {this.state.selectedYear}</p>
                                                </div>
                                                <ResponsiveContainer key={key + "graph3"} minHeight={380} height={600}>
                                                    <PieChart width={340} height={600}>
                                                        <Pie data=
                                                            {
                                                                this.state.data1.data[this.state.selectedYear][this.state.selectedCourse][key]
                                                            }
                                                            dataKey="fail" nameKey="code" cx="50%" cy="50%" outerRadius={90} fill="#8884d8"
                                                            label={renderCustomizedLabel} >
                                                            {this.state.data1.data[this.state.selectedYear][this.state.selectedCourse][key].map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Pie data={[
                                                            {
                                                                "name": "Pass",
                                                                "data": this.state.data1.studentCount[this.state.selectedYear][this.state.selectedCourse][key].pass
                                                            },
                                                            {
                                                                "name": "Fail",
                                                                "data": this.state.data1.studentCount[this.state.selectedYear][this.state.selectedCourse][key].fail
                                                            },
                                                        ]}
                                                            dataKey="data" nameKey="name" cx="50%" cy="50%" innerRadius={95} outerRadius={120} fill="#82ca9d" label >
                                                            <Cell key={'cell-0'} fill={"#82ca9d"} />
                                                            <Cell key={'cell-1'} fill={"#ff1d1d"} />
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </header>
                                        <div className="badge mxw90p">
                                            {this.state.data1.studentCount[this.state.selectedYear][this.state.selectedCourse][key].report}
                                        </div>
                                    </div>
                                )
                            }
                            else
                                return null;
                        })
                        }
                    </div>
                }
            </div>
        );
    }
}
export default CollegeReport;