import { Component } from "react";
import updateIcon from '../ToggleButton/sync.svg'
import './gradecard.scss'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { API_HOST } from "../../Database/db";
const sems = ["1st sem", "2nd sem", "3rd sem", "4th sem", "5th sem", "6th sem", "7th sem", "8th sem"]
const NOTSTARTED = 0;
const FETCHING = 1;
const DONE = 2;
const ERROR = -1;
class GradeCard extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.showAdditionalInfo = this.showAdditionalInfo.bind(this);
        this.showModal = this.showModal.bind(this);
        this.state = { title: props.title, semData: props.semData, showInfo: {}, chartState: NOTSTARTED, chartData: null }
    }
    showModal(e) {
        e.stopPropagation();
    }
    showAdditionalInfo(e) {
        e.stopPropagation();
        let info = this.state.showInfo;
        const feild = e.currentTarget.getAttribute("data");
        info[feild] = !info[feild];
        this.setState(s => ({ showInfo: info }));
    }
    getPercentile(analData, chartData) {
        let obj1 = {}, obj2 = {}
        for (let subCode in chartData) {
            let myCGPA = parseFloat(chartData[subCode].CGPA);
            let studentBelowMe = 0.0, totalStudent = 0.0;
            let analyticsArray = analData[subCode];
            //console.log(chartData);
            for (let i = 0; i < analyticsArray.length; i++) {
                if (parseFloat(analyticsArray[i].CGPA) < myCGPA)
                    studentBelowMe += analyticsArray[i].count;
                totalStudent += analyticsArray[i].count;
            }
            obj2[subCode] = { percentile: ((studentBelowMe / totalStudent) * 100).toFixed(2), studentBelowMe: studentBelowMe, totalStudent: totalStudent }
            obj1[this.props.semNo] = obj1[this.props.semNo] || [];
            obj1[this.props.semNo].push({ percentile: parseFloat(((studentBelowMe / totalStudent) * 100).toFixed(2)), subCode: subCode, subName: chartData[subCode].subjectName })
        }
        if (this._isMounted) {
            this.setState(() => ({
                percentile: obj2
            }))
            this.props.percentileCallback(obj1);
        }
    }
    processAndSort(arr) {
        let obj = []
        for (let i = 0; i < 10; i++) {
            obj[i] = { CGPA: (i + 1).toString(), count: 0 }
        }
        for (let i = 0; i < arr.length; i++) {
            obj[parseInt(arr[i].CGPA) - 1] = { "CGPA": arr[i].CGPA, count: arr[i].count }
        }
        //console.log(obj);
        return obj;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidMount(prevProps, prevState) {
        this._isMounted = true;
        //console.log("componentDidUpdate");
        if (this.props.singleSem && this.state.chartState === NOTSTARTED) {
            this.setState(() => ({ chartState: FETCHING }));
            //console.log(API_HOST + "/analytics/subjects/" + this.props.roll + "/" + this.props.semNo);
            fetch(API_HOST+"/analytics/subjects/" + this.props.roll + "/" + this.props.semNo)
                .then(res => res.json())
                .then((result) => {
                    //console.log(result);
                    if (result['SM0' + this.props.semNo]) {
                        //console.log(this.state.semData, result['SM0' + this.props.semNo]);
                        this.getPercentile(result['SM0' + this.props.semNo], this.state.semData)
                        if (this._isMounted)
                            this.setState(() => ({ chartData: result['SM0' + this.props.semNo], chartState: DONE }));
                    }
                    /*if (result.name){
                        for (var key in result) {
                            this.setState(()=>({chartData:result[key]}));
                            break;
                        }
                    }
                    else
                        toast("Records not Found!", { type: toast.TYPE.INFO });

                    this.setState(() => ({ semResult: result, fetchState: DONE }));*/
                    //console.log(result);
                },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        this.setState(() => ({ chartState: ERROR }));
                        console.log(error);
                    }
                )
        }
    }
    render() {
        let items
        let marksTotal = 0, fullMarks = 0;
        let avg = 0, semcount = 0;
        if (this.props.singleSem) {
            if (this.props.semData.info)
                return null;
            items = Object.keys(this.props.semData).map((key, index) => {
                let semObj = this.props.semData[key];
                marksTotal += parseFloat(semObj.CGPA) * parseFloat(semObj.weightage);
                fullMarks += parseFloat(semObj.weightage);
                return (
                    <div className="row" key={index} data={key} onClick={this.showAdditionalInfo}>
                        <span className="subject">{semObj.subjectName}</span>
                        <span className="marks">{semObj.CGPA + " GCPA"}</span>
                        <div className="progress">
                            <div style={{ maxWidth: semObj.CGPA * 10 + "%" }}></div>
                        </div>
                        {this.state.showInfo[key] &&
                            <div className="chartdiv" onClick={this.showModal}>
                                {this.state.chartData &&
                                    <ResponsiveContainer minHeight={100} maxHeight={200} width="100%" height="100%" >
                                        {this.state.chartData &&
                                            <BarChart data={this.processAndSort(this.state.chartData[key])}>
                                                <CartesianGrid strokeDasharray="1 1" />
                                                <XAxis height={40} dataKey="CGPA" label={{ value: "CGPA", position: "insideBottomMiddle", dx: 0, dy: 13 }} />
                                                <YAxis label={{ value: "Students", position: "outsideMiddle", angle: -90, dx: -20 }} />
                                                <Tooltip cursor={{ fill: '#fff' }} />
                                                <Bar dataKey="count" >{
                                                    this.processAndSort(this.state.chartData[key]).map((value, subIndex) =>
                                                        <Cell key={subIndex} fill={value.CGPA === semObj.CGPA ? "#e60000" : "#000000 "} />
                                                    )
                                                }
                                                </Bar>
                                            </BarChart>}
                                    </ResponsiveContainer>
                                }
                                {this.state.percentile && <div style={{ textAlign: 'start', fontFamily: 'Open Sans' }}>
                                    Subject code: {key} <br></br>
                                    Percentile: {this.state.percentile[key].percentile} %<br></br>
                                    {this.state.percentile[key].percentile > 0 &&
                                        "Performed better then " + this.state.percentile[key].studentBelowMe +
                                        " Out of " +
                                        this.state.percentile[key].totalStudent + " students"}
                                </div>
                                }
                                {!this.state.chartData &&
                                    <img className="updating" src={updateIcon} />
                                }
                            </div>
                        }
                    </div>
                )
            });
        }
        else {
            items = Object.keys(this.props.semData).map((key, index) => {
                if (['SM01', 'SM02', 'SM03', 'SM04', 'SM05', 'SM06', 'SM07', 'SM08'].includes(key)) {
                    let width, semtotalStudent = 0, semfullMarks = 0;
                    let semObj = this.props.semData[key];
                    if (semObj.info)
                        semtotalStudent = "(Not found) N/A";
                    else {
                        //console.log(semObj);
                        semcount++;
                        for (let i in semObj) {
                            semtotalStudent += parseFloat(semObj[i].CGPA) * parseFloat(semObj[i].weightage);
                            semfullMarks += parseFloat(semObj[i].weightage);
                        }
                        //console.log(marksTotal, fullMarks);
                        avg += (semtotalStudent / semfullMarks);
                        //console.log(avg,semcount);
                        width = (semtotalStudent / semfullMarks) * 10 + "%";
                        semtotalStudent = (semtotalStudent / semfullMarks).toFixed(2) + " CGPA"
                    }
                    const MiniPreview = Object.keys(semObj).map((subKey, subIndex) => (
                        <div className="sub-row" key={subIndex} data={subKey} onClick={this.showAdditionalInfo}>
                            <span className="subject">{semObj[subKey].subjectName}</span>
                            <span className="marks">{semObj[subKey].CGPA + " GCPA"}</span>
                            <div className="progress">
                                <div style={{ maxWidth: semObj[subKey].CGPA * 10 + "%" }}></div>
                            </div>
                        </div>
                    ));
                    return (
                        <div className="row" key={index} data={key} onClick={this.showAdditionalInfo}>
                            <span className="subject">{sems[key[key.length - 1] - 1]}</span>
                            <span className="marks">{semtotalStudent}</span>
                            <div className="progress">
                                <div style={{ maxWidth: width, borderColor:semObj.info?"red":"#000"}}></div>
                            </div>
                            {this.state.showInfo[key] && !semObj.info && <div className="gradecard height-anim" style={{ borderRadius: "12px", margin: "0 0" }}>
                                {MiniPreview}
                            </div>}
                        </div >
                    )
                }
                return null
            }
            );
        }
        return (
            <div className="gradecard">
                <header>{this.state.title}</header>
                {!this.props.singleSem &&
                    <div className="roll" style={{ fontWeight: "800", paddingBottom: "14px" }}>
                        {this.props.roll}
                    </div>
                }
                {items}
                {this.props.singleSem &&
                    <div className="row" style={{ marginTop: "auto" }}>
                        <span className="subject" style={{ fontSize: "32px" }}>Total</span>
                        <span className="marks" style={{ fontSize: "32px" }}>{(marksTotal / fullMarks).toFixed(2) + " CGPA"}</span>
                    </div>
                }
                {!this.props.singleSem &&
                    <div className="row" style={{ marginTop: "auto" }}>
                        <span className="subject" style={{ fontSize: "32px" }}>Total</span>
                        <span className="marks" style={{ fontSize: "32px" }}>{(avg / semcount).toFixed(2) + " CGPA"}</span>
                    </div>
                }
            </div>
        )
    }
}
//singleSem
export default GradeCard;