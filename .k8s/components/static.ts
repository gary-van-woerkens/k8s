import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/nginx";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";
import { getGithubRegistryImagePath } from "@socialgouv/kosko-charts/utils/getGithubRegistryImagePath";
import { getManifestByKind } from "@socialgouv/kosko-charts/utils/getManifestByKind";
import { Ingress } from "kubernetes-models/networking.k8s.io/v1beta1/Ingress";

import { addIngressAnnotations } from "../utils/addIngressAnnotations";

import Config from "../utils/config";

export default () => {
  const {
    name,
    type,
    subdomain,
    ingress,
    registry = "harbor",
    project
  } = Config();

  const image = registry === "ghcr"
    ? getGithubRegistryImagePath({ name, project: project || name })
    : getHarborImagePath({ name })

  if (type === "static") {
    const manifests = create(name, {
      env,
      config: { subdomain },
      deployment: { image },
    });

    if (ingress && ingress.annotations) {
      const deploymentIngress = getManifestByKind(
        manifests,
        //@ts-expect-error
        Ingress
      ) as Ingress;
      addIngressAnnotations(deploymentIngress, ingress.annotations);
    }

    return manifests;
  }
  return [];
};
