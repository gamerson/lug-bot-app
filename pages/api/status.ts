import PROJECT from '../../dummy-data';

export default (req, res) => {
	res.status(200).json(PROJECT);
};
