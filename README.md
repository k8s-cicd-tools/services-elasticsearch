## Services - Elasticsearch

A distributed search and analytics engine. Contains Kubernetes manifests, implementation using Pulumi, and Jenkinsfile pipeline.

It is a StatefulSet with 3 replicas and a Service exposing port 9200 and 9300.

## How to get started

1. Install kubectl and pulumi.
2. Clone this repo.
3. Run `$ npm install`
4. Run `$ pulumi up` to create the kubernetes resources.
5. Run `$ kubectl get pods` or `$ kubectl get all` to see the status of the pods.
6. Forward a local port to a port on the Pod. e.g. `$ kubectl port-forward <pod-name>  9200:9200`
7. Or forward a local port to a port on the Service. e.g. `$ kubectl port-forward <service-name>  9200:9200`
8. Open a browser and navigate to http://localhost:9200
9. Run `$ pulumi destroy` to delete the kubernetes resources.

Alternatively, you can use kubectl directly:

```
$ kubectl apply -f path/to/kubernetes/manifests/elasticsearch.yaml
$ kubectl get all 
$ kubectl port-forward <pod-name>  9200:9200
$ kubectl port-forward <service-name>  9200:9200
open http://localhost:9200
$ kubectl delete -f path/to/kubernetes/manifests/elasticsearch.yaml
```

Alternatively, you can use the Jenkinsfile to run the pipeline:

| Jenkinsfile                        | Description                                |
|------------------------------------|--------------------------------------------|
| jenkins/Jenkinsfile-pulumi-up      | This will create the kubernetes resources. |
| jenkins/Jenkinsfile-pulumi-destroy | This will delete the kubernetes resources. |

Environment variables required by Jenkins:

| Name                | Description                                |
|---------------------|--------------------------------------------|
| PULUMI_ACCESS_TOKEN | It is the access token to the Pulumi account. It is recommended to create a key with the same name in the credentials manager. |


Other requirements:
1. A jenkins agent with pulumi and kubectl installed and configured to connect to the kubernetes cluster.
2. The agent must have the "pulumi" label
3. Global tool configuration: add a NodeJS 16.17.0 installation with the name "node 16.17.0"
4. Configure the SCM Pipeline script with this repository, select the branch and change the Jenkins file path to the corresponding option to deploy.


## Resources and dependencies

| Name            | Version | Required |
|-----------------|---------|----------|
| kubernetes      | 1.23    | yes      |
| pulumi          | 3.38.0  | no       |
| elasticsearch   | 7.17.0  | yes      |

#### Also:
- create a Kubernetes namespace named "monitoring"
- Storage: 6 GB of disk space for DB and logs, this for testing purposes.

## Support kubernetes versions

| Version k8s | Description | Branch |
|-------------|-------------|---------|
| 1.23        |             | main    |
