import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayLayout from '@clayui/layout';
import React from 'react';

import TaskFilter from '../../components/TaskFilter';
import TaskList from '../../components/TaskList';
import API_ENDPOINT from '../../constants/apiEndpoint';
import cancelRunningTask from '../../utils/cancelRunningTask';

export default function Tasks({
	lugbot,
	project,
	states,
	taskStateFilter,
	tasks,
}) {
	const isLocalInstance = lugbot.mode === 'LOCAL';

	return (
		<ClayLayout.ContainerFluid view>
			<ClayLayout.ContentRow>
				<ClayLayout.ContentCol expand>
					<h1>
						{project.url ? (
							<a href={project.url} target="blank">
								{project.name}
							</a>
						) : (
							<span>{project.name}</span>
						)}
					</h1>

					<ClayLayout.ContentRow
						className={
							isLocalInstance ? 'justify-content-end mb-3' : ''
						}
					>
						{!isLocalInstance && (
							<ClayLayout.ContentCol expand>
								<p>Git: {project.location}</p>
							</ClayLayout.ContentCol>
						)}

						<ClayLayout.ContentCol>
							<ClayButton
								className="btn-danger mr-2"
								onClick={() =>
									tasks.runningTasks.forEach((task) => {
										cancelRunningTask(task.id);
									})
								}
								small
							>
								<span className="inline-item inline-item-before">
									<ClayIcon symbol="trash" />
								</span>

								{'Cancel all tasks'}
							</ClayButton>
						</ClayLayout.ContentCol>

						<TaskFilter
							states={states}
							taskStateFilter={taskStateFilter}
						/>
					</ClayLayout.ContentRow>
				</ClayLayout.ContentCol>
			</ClayLayout.ContentRow>

			<TaskList
				initialTasks={tasks}
				states={states}
				taskStateFilter={taskStateFilter}
			/>

			{isLocalInstance && (
				<ClayLayout.ContentRow>
					<ClayButton
						className="btn-danger ml-auto"
						onClick={() =>
							fetch(`${API_ENDPOINT}/shutdown`, {
								method: 'POST',
							})
						}
					>
						{'Stop Lugbot'}
					</ClayButton>
				</ClayLayout.ContentRow>
			)}
		</ClayLayout.ContainerFluid>
	);
}

export async function getServerSideProps(context) {
	const {completedTasks, lugbot, pendingTasks, projects, runningTasks} =
		await fetch(`${API_ENDPOINT}/status`).then((res) => res.json());

	const states = await fetch(`${API_ENDPOINT}/taskStateUI`).then((res) =>
		res.json()
	);

	return {
		props: {
			lugbot,
			project: projects[0],
			states: {
				byName: states,
				byState: Object.values(states).reduce((acc, state: object) => {
					// @ts-ignore: state.state is not properly recognised
					acc[state.state] = state;

					return acc;
				}, {}),
				completedFailureState: states.completedFailure,
				completedSuccessState: states.completedSuccess,
				pendingState: states.pending,
				runningState: states.running,
			},
			taskStateFilter: context.query.status || '',
			tasks: {
				completedTasks,
				pendingTasks,
				runningTasks,
			},
		},
	};
}
