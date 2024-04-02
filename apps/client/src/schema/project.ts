import * as Yup from 'yup';

export const projectSchema = Yup.object({
    projectName: Yup.string()
        .matches(/^[a-z0-9]+$/, 'Project name can only contain lowercase letters and numbers')
        .min(6, 'Project name must be at least 6 characters')
        .max(32, 'Project name must be at most 32 characters'),
    gitHubUrl: Yup.string()
        .matches(
            /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_]+$/,
            'Invalid GitHub URL'
        )
        .required('GitHub URL is required')
});
