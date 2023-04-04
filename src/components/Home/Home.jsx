import colleges from '../../Database/db';
import RatingBar from '../Ratings/Ratings';
import Typer from '../Typer/Typer'
import './home.scss'
import resultPreviewImg from './result-prev.png'
import subPreviewImg from './sub-res.png'
import distImg from './distribution.png'
import studentComp from './student-comp.png'
import multiRepImg from './multi-prev.png'
import collegeAnalytiycs from './college-analytics.png'
import subAnalytiycs from './sub-analytics.png'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
function Home(props) {
    const data = [
        {
            name: 'Page A',
            uv: 4000,
            pv: 2400,
            amt: 2400,
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
            amt: 2210,
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
            amt: 2290,
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
            amt: 2000,
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
            amt: 2181,
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
            amt: 2500,
        },
        {
            name: 'Page G',
            uv: 3490,
            pv: 4300,
            amt: 2100,
        },
    ];

    return (
        <div id="home">

            <header >
                <span className="title">Grade Card Analyzer!</span>
                <text>works with</text>
                <Typer className="typer" color="black" dataText={Object.values(colleges)} spacing={3} />
                <hr style={{ width: '10%', margin: '24px auto' }} />
                <p style={{ margin: 'auto', color:"red"}}>IMPORTAMT NOTICE: MAKAUT CHANGED THEIR RESULT WEBSITE TO <a href="https://makaut.mastersofterp.in">MASTERSOFTERP</a>. IT WILL NOT WORK FOR RESULTS AFTER 2022, I WILL ADD OPTIONS FOR UPLOADING THE PDF DIRECTLY TO GET ANALYTICS</p>
                <div className="flex">
                    <img src={resultPreviewImg}></img>
                    <div style={{ display: 'inline-grid', margin: '32px 24px' }}>
                        <span>MAKAUT STUDENT REPORT</span>
                        <text>This is an analytics tool for your semester results as well as a rating card for your profile.
                            It works for most of the MAKAUT colleges and shows your results and various analytics data like
                            with Bar Chart per subjects showing your CGPA amongst everyone's performance, individual
                            subject reports and overall semester percentile from <a>MAKAUT API</a></text>
                    </div>
                </div>
                <hr style={{ width: '10%', margin: '24px auto' }} />
                <div className="flex">
                    <span># The Rating System</span>
                    <RatingBar count={Math.floor(Math.random() * 3) + 3} />
                    <p>The better the <b>PERCENTILE</b> the better the <b>RATING</b>. The CGPA of each selected semester is evaluated amongst all the
                        students of the same course and the average percentile is calculated, 5 🌟 the student is academically better then 80% of the crowd,
                        4 🌟 is better then 60% and so on...</p>
                    <div style={{ display: 'inline-grid', margin: '32px 24px' }}>
                        <span>The Subject Radar</span>
                        <text>One may get 10 CGPA easily in one subject and struggle for 7 CGPA on other. But with The recruiter can under-estimate your hard work
                            as you dont have a perfect 10 on your card. This is where percentile based marks can be helpful to show the percentage of people you are
                            better then.The Subject Radar shows you your percentile based score to help you get more meaningfully results
                        </text>
                    </div>

                    <img src={subPreviewImg}></img>

                    <div style={{ height: '32px', width: '100%' }}></div>

                    <img src={distImg}></img>
                    <div style={{ display: 'inline-grid', margin: '32px 24px' }}>
                        <span>Semester Analytics</span>
                        <text>This is an analytics tool for your semester results! It works for most of the MAKAUT colleges and shows your results
                            with Bar Chart per subjects showing your CGPA amongst everyone's performance from <a>MAKAUT API</a></text>
                    </div>
                    <div style={{ height: '64px', width: '100%' }}></div>
                </div>
                <span className="">Multi Report</span>
                <hr style={{ width: '10%', margin: '24px auto' }} />
                <div className="flex">
                    <img src={multiRepImg}></img>
                    <div style={{ display: 'inline-grid', margin: '32px 24px' }}>
                        <span>Get the whole class results!</span>
                        <text>Just put the beginning and ending roll number of any batch and the results are at
                            you finger tips! Sort the results by various parameters and find the Topper or the bottom ranker see your place amongst all</text>
                    </div>
                    <div style={{ height: '32px', width: '100%' }}></div>
                    <img src={studentComp}></img>
                    <div style={{ display: 'inline-grid', margin: '32px 24px' }}>
                        <span>Compare student on the go!</span>
                        <text>Add students from same or different institutes batches or even years! it will show you relevant parameters and charts to give you a brief comparison reliably and fast</text>
                    </div>
                </div>
                <div style={{ height: '52px', width: '100%' }}></div>
                <span className="title">Institutional Analytics</span>
                <hr style={{ width: '10%', margin: '24px auto' }} />
                <div className="flex">
                    <div style={{ display: 'inline-grid', margin: '32px 24px' }}>
                        <span>College Analytics!</span>
                        <text>It shows you the performance metrics of different colleges, their subjects and the student batches. 
                            It detects the exam and This indicates the possibility of question paper being too easy or uncovered 
                            syllabus by the organization, question paper with out of syllabus questions or an excessively lengthy 
                            question paper and  lack of communication of students with teaching faculty</text>
                    </div>
                    <img src={collegeAnalytiycs}></img>
                    <div style={{ display: 'inline-grid', margin: '32px 24px' }}>
                        <span>Subject performance for faculty!</span>
                        <text>Shows you the batch wise data for a particular subject for different colleges. Helps finding the average performance and subject teaching quality improvements each year</text>
                    </div>
                    <img src={subAnalytiycs}></img>
                </div>
            </header>
            <footer>
                <span className="title">A project on <img className="rotate" src="https://github.com/prasannathapa/reportcard/raw/master/public/logo192.png"></img>
                    and <img src="https://github.com/prasannathapa/reportcard/raw/master/public/nodejs.png"></img> by <a href="https://prasanna-thapa.herokuapp.com/" target="_blank">Prasanna Thapa</a></span>
            </footer>
        </div>
    )
}
export default Home;