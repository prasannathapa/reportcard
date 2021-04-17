import { isMobile } from 'react-device-detect';
import Lottie from 'react-lottie-player';
import animationData from './star.json';

function RatingBar(props){
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };
    let size = isMobile ? '70px':'80px';
    return (
        <div className={props.className} style={{ display: 'flex', flexDirection: 'row' }}>
            {[1, 2, 3, 4, 5].map((val, index) =>
                <Lottie
                    key={val}
                    animationData={animationData}
                    options={defaultOptions}
                    style={{ width: size, height: size, display: 'inline-block'}}
                    play={props.count >=  val}
                    loop={false}
                />
            )}
        </div>
    )
}

export default RatingBar;