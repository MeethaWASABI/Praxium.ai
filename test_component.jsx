const Test = () => { 
};

const MissionMap = ({ level = 1 }) => {
    const nodes = useMemo(() => [
        { x: 50, y: 150, id: 1, title: 'Basics' },
        { x: 150, y: 80, id: 2, title: 'Logic' },
        { x: 250, y: 120, id: 3, title: 'Variables' },
        { x: 350, y: 60, id: 4, title: 'Loops' },
        { x: 450, y: 140, id: 5, title: 'Functions' },
    ], []);

     };