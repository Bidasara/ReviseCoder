import { useProblemContext } from '../../contexts/ProblemContext.jsx';
import { useScroll } from '../../contexts/ScrollContext.jsx';
import Scroll from '../common/Scroll.jsx';
import Category from './Category.jsx';

const Dropdown = () => {
    const { currentList, data } = useProblemContext();
    const {openCategory,setOpenCategory} = useScroll();

    return (
        <>
            <Scroll
                items={data?.lists.find(list => list?._id === currentList?._id)?.categories}
                renderItem={Category}
                height={"h-1/4"}
                openCategory = {openCategory}
                setOpenCategory={setOpenCategory}
            />
        </>
    );
};

export default Dropdown;