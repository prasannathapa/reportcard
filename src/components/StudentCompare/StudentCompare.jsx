import { Component } from "react";
import { isMobile } from "react-device-detect";
import { toast, ToastContainer } from "react-toastify";
import SearchBox from "../SearchBox/SearchBox";
import updateIcon from "../ToggleButton/sync.svg";
import tickIcon from "../ToggleButton/done.svg";
import SearchList from "../SearchList/SearchList";
import { API_HOST, colors } from "../../Database/db";
import { Bar, BarChart, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const sems = ["1st sem", "2nd sem", "3rd sem", "4th sem", "5th sem", "6th sem", "7th sem", "8th sem"]
const IDLE = 0;
const FETCHING = 1;
const DONE_SCORE = 2;
const DONE_ANALYTICS = 3;
const DONE_ALL = 4;
const SHOWING_DATA = 10;
const ERROR = -1;
const offset = Math.floor(Math.random() * 101);

class StudentCompare extends Component {
    constructor(props) {
        super(props);
        this.searchState = this.searchState.bind(this);
        this.semsQueryHandler = this.semsQueryHandler.bind(this);
        this.searchTextUpdate = this.searchTextUpdate.bind(this);
        this.addStudent = this.addStudent.bind(this);
        this.ItemClickUpdate = this.ItemClickUpdate.bind(this);
        this.getData = this.getData.bind(this);
        let mySavedState = JSON.parse(localStorage.getItem('Student_comparasion_state') || "{}");
        if (JSON.stringify(mySavedState) !== "{}")
            this.state = mySavedState;
        else
            this.state = { input: false, text: "", fetchState: IDLE, studentList: [], sems: [] }
    }
    searchState(isActive) {
        let apiState = this.state.fetchState;
        if (apiState !== FETCHING)
            apiState = IDLE;
        this.setState({ input: isActive, fetchState: apiState });
    }
    searchTextUpdate(updatedText) {
        this.setState({ text: updatedText });
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    addStudent() {

        if (this.state.fetchState !== FETCHING && this._isMounted) {
            let studentList = this.state.studentList;
            if (!studentList.includes(this.state.text))
                studentList.push(this.state.text);
            this.setState({ fetchState: IDLE, text: "", input: false, studentList: studentList });
        }
        else {
            toast("Processing results. Please wait!", { type: toast.TYPE.DARK })
        }
    }
    ItemClickUpdate(key) {
        let studentList = this.state.studentList;
        studentList.splice(key, 1);
        this.setState({ studentList: studentList });
    }
    semsQueryHandler(e) {
        const data = e.currentTarget.getAttribute("item-id");
        let update = this.state.sems;
        update[data] = !update[data]
        this.setState(() => ({
            sems: update,
            fetchState: IDLE
        }));
    }
    getPercentile(data, cgpa) {
        console.log(data, cgpa);
        cgpa = parseFloat(cgpa) / 10;
        let studentBelowMe = 0, total = 0;
        for (let item of data) {
            if (parseFloat(item.CGPA) < cgpa)
                studentBelowMe += item.count
            total += item.count;
        }
        return ((studentBelowMe / total) * 100).toFixed(2) * 1;
    }
    async getStudentStats(idx, semesterProgressAnalyticsArray,subjectPercentileAnalyticsArray,nameMap,semList) {
        let roll = this.state.studentList[idx];
        let studentdata = await fetch(API_HOST + "/" + roll + "/" + semList)
            .then(res => res.json());
        if (studentdata.results) {
            for (let i in semesterProgressAnalyticsArray) {
                let sem = semesterProgressAnalyticsArray[i].name;
                semesterProgressAnalyticsArray[i][roll + "'s CGPA"] = (studentdata.results[sem] * 10).toFixed(3) * 1;
            }
        }
        if (studentdata.name)
            nameMap[roll] = studentdata.name;
        else {
            toast(roll + "'s data not found!", { type: toast.TYPE.DARK });
            let list = this.state.studentList;
            list.splice(idx, 1);
            this.setState({ fetchState: FETCHING, savedStudentList: list });
            return;
        }
        for (let key of ["SM01", "SM02", "SM03", "SM04", "SM05", "SM06", "SM07", "SM08"]) {
            if (key in studentdata) {
                if (!studentdata[key].info) {
                    for (let subCode in studentdata[key]) {
                        let found = false;
                        for (let i in subjectPercentileAnalyticsArray) {
                            if (subjectPercentileAnalyticsArray[i].name === subCode) {
                                found = true;
                                subjectPercentileAnalyticsArray[i][roll + "'s CGPA"] = studentdata[key][subCode].CGPA * 10;
                            }
                        }
                        if (!found) {
                            subjectPercentileAnalyticsArray.push({
                                "name": subCode,
                                "subjectName": studentdata[key][subCode].subjectName,
                                [roll + "'s CGPA"]: studentdata[key][subCode].CGPA * 10,
                            });
                        }
                    }
                }
            }
        }
        let cgpaData = await fetch(API_HOST + "/analytics/cgpa/" + roll + "/" + semList)
            .then(res => res.json());
        if (!cgpaData.error) {
            for (let key of ["SM01", "SM02", "SM03", "SM04", "SM05", "SM06", "SM07", "SM08"]) {
                if (key in cgpaData) {
                    for (let i in semesterProgressAnalyticsArray) {
                        if (semesterProgressAnalyticsArray[i].name === key) {
                            semesterProgressAnalyticsArray[i][roll + "'s PCTL"] =
                                this.getPercentile(cgpaData[key],
                                    semesterProgressAnalyticsArray[i][roll + "'s CGPA"]);
                        }
                    }
                }
            }
        }
        let subjectData = await fetch(API_HOST + "/analytics/subjects/" + roll + "/" + semList)
            .then(res => res.json());
        if (!subjectData.error) {
            for (let key of ["SM01", "SM02", "SM03", "SM04", "SM05", "SM06", "SM07", "SM08"]) {
                if (key in subjectData) {
                    for (let subCode in subjectData[key]) {
                        for (let i in subjectPercentileAnalyticsArray) {
                            if (subjectPercentileAnalyticsArray[i].name === subCode) {
                                subjectPercentileAnalyticsArray[i][roll + "'s PCTL"] =
                                    this.getPercentile(subjectData[key][subCode], subjectPercentileAnalyticsArray[i][roll + "'s CGPA"])
                            }
                        }
                    }
                }
            }
        }
    }
    async getData() {
        this.setState({ fetchState: FETCHING, savedStudentList: this.state.studentList });
        let semList = "";
        let semesterProgressAnalyticsArray = [];
        let subjectPercentileAnalyticsArray = [];
        let nameMap = {};
        for (const i in this.state.sems)
            if (this.state.sems[i] === true) {
                semList += (1 + parseInt(i)).toString();
                semesterProgressAnalyticsArray.push({ "name": "SM0" + (1 + parseInt(i)).toString() })
            }
        let downloadTask = [];
        for (let idx in this.state.studentList) {
            downloadTask.push(this.getStudentStats(idx,semesterProgressAnalyticsArray,subjectPercentileAnalyticsArray, nameMap,semList));
        }
        await Promise.all(downloadTask);
        this.setState({ nameMap: nameMap, fetchState: SHOWING_DATA, SubjectPAA: subjectPercentileAnalyticsArray, SemesterPAA: semesterProgressAnalyticsArray });
        if (this.state.fetchState === SHOWING_DATA)
            localStorage.setItem("Student_comparasion_state", JSON.stringify(this.state))
    }
    chunkArray(arr, size) {
        let arrayOfArrays = [];
        for (var i = 0; i < arr.length; i += size) {
            arrayOfArrays.push(arr.slice(i, i + size));
        }
        return arrayOfArrays;
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
        const semsBtn = sems.map((item, index) =>
            <button key={index} className={(this.state.sems[index]) ? "toggle on" : "toggle off"} onClick={this.semsQueryHandler} item-id={index}>
                {item}
            </button>
        );
        return (
            <div className="search">
                <ToastContainer />
                <SearchBox
                    title="Add student roll number."
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
                {(this.state.input || this.state.text || this.state.studentList.length > 0) && (this.state.fetchState !== DONE_ALL || this.state.fetchState !== DONE_SCORE) &&
                    <div className="toolbox">
                        {semsBtn}
                    </div>
                }
                {this.state.text.length >= 11 &&
                    <div className="toolbox">
                        <div className="toolbox"></div>
                        <button className={resultState} onClick={this.addStudent}>
                            <span className="submit">Add</span>
                            <span className="loading"><img src={updateIcon} alt="" /></span>
                            <span className="check"><img src={tickIcon} alt="" /></span>
                        </button>
                    </div>
                }
                {this.state.studentList.length > 0 &&
                    <SearchList
                        filterText={'0'}
                        list={this.state.studentList}
                        allAlwaysSelected={true}
                        ItemClickUpdate={this.ItemClickUpdate}
                        hideGradient={this.state.fetchState === DONE_ALL}
                        maxLimitReachMsg={"You can only select 2 colleges at maximun to compare"} />
                }
                {this.state.studentList.length > 0 && this.checkAnySemList() && this.state.fetchState !== SHOWING_DATA &&
                    <div className="toolbox">
                        <button className={resultState} onClick={this.getData}>
                            <span className="submit">Show Comparision</span>
                            <span className="loading"><img src={updateIcon} alt="" /></span>
                            <span className="check"><img src={tickIcon} alt="" /></span>
                        </button>
                    </div>
                }
                {this.state.fetchState === SHOWING_DATA &&
                    <div className="resultbox">
                        <ResponsiveContainer width="90%" height={400}>
                            <ComposedChart
                                width={360}
                                height={300}
                                data={this.state.SemesterPAA}
                            >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(v, k, i) => [(k.endsWith('CGPA')) ? (v / 10).toFixed(2) : v + "%", k]} />
                                <Legend />
                                {
                                    this.state.savedStudentList.map((v, k) => {
                                        return (
                                            <Bar name={this.state.nameMap[v] + "'s CGPA"} key={k + "bar"} type="linear" dataKey={v + "'s CGPA"} fill={colors[(k+ offset) % colors.length] + 'AA'} />
                                        )
                                    })
                                }
                                {
                                    this.state.savedStudentList.map((v, k) => {
                                        return (
                                            <Line name={this.state.nameMap[v] + "'s Percentile"} key={k + 'line'} type="linear" strokeWidth={3} dataKey={v + "'s PCTL"} stroke={colors[(k + offset) % colors.length]} />
                                        )
                                    })
                                }
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                }
                {this.state.fetchState === SHOWING_DATA &&
                    <div className="resultbox">
                        {(this.chunkArray(this.state.SubjectPAA, 4)).map((subArr, key) => {
                            return (
                                <header>
                                    <div style={{ display: "block", Height: "400px" }}>
                                        <ResponsiveContainer width={360} height={300}>
                                            <BarChart
                                                width={500}
                                                data={subArr}
                                            >
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip formatter={(v, k, i) => [(k.endsWith('CGPA')) ? (v / 10).toFixed(2) : v + "%", k]} />
                                                {key == (this.state.SubjectPAA.length/4) -1 && <Legend />}
                                                {
                                                    this.state.savedStudentList.map((v, k) => {
                                                        return (
                                                            <Bar stackId={v} name={this.state.nameMap[v] + "'s CGPA"} key={k + "bar"} type="linear" dataKey={v + "'s CGPA"} fill={colors[(k + offset) % colors.length] + 'AA'} />
                                                        )
                                                    })
                                                }
                                                {
                                                    this.state.savedStudentList.map((v, k) => {
                                                        return (
                                                            <Bar stackId={v} name={this.state.nameMap[v] + "'s Percentile"} key={k + 'line'} type="linear" strokeWidth={3} dataKey={v + "'s PCTL"} fill={colors[(k + offset )% colors.length]} />
                                                        )
                                                    })
                                                }
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </header>
                            )
                        })}


                    </div>
                }</div>)
    }
    checkAnySemList() {
        for (const i in this.state.sems)
            if (this.state.sems[i] === true)
                return true;
        return false;
    }
}
export default StudentCompare;