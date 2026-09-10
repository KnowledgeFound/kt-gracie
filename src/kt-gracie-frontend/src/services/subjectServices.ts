import { kt_gracie_backend } from 'declarations/kt-gracie-backend';
import { CreateSubjectInput } from 'src/types/types';

export async function createSubject(subject: CreateSubjectInput): Promise<string> {
  const result = await kt_gracie_backend.createSubjectMediator(
    subject.name,
    subject.code,
    subject.duration,
    subject.description
  );

  console.log(result);

  if ('ok' in result) {
    return result.ok;
  } else {
    throw new Error(result.err);
  }
}