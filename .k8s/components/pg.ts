import env from "@kosko/env";
import { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import { create } from "@socialgouv/kosko-charts/components/azure-pg";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";
import Config from "../utils/config";

export default async () => {
  const { azurepg } = Config() ?? {};

  if (!azurepg) {
    return [];
  }

  if (env.env === "dev") {
    return create({
      env,
    });
  }

  // in prod/preprod, we try to add a fixed sealed-secret
  const secret = await loadYaml<SealedSecret>(
    env,
    `pg-user.sealed-secret.yaml`
  );
  if (!secret) {
    return [];
  }

  const envParams = gitlab(process.env);
  // add gitlab annotations
  updateMetadata(secret, {
    annotations: envParams.annotations || {},
    labels: envParams.labels || {},
    namespace: envParams.namespace,
  });
  return [secret];
};
