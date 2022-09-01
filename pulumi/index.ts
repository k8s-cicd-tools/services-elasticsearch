import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as kubernetes from "@pulumi/kubernetes";

const namespace = "monitoring"
const serviceName = "elasticsearch";
const appLabels = { app: "elasticsearch" };
const appServicePort = 9200;
const appServicePortName = "rest";
const appServicePortProtocol = "TCP";
const appServiceInterNodePort = 9300;
const appServiceInterNodePortName = "inter-node";
const appServiceInterNodePortProtocol = "TCP";

const statefulset = new kubernetes.apps.v1.StatefulSet("statefulset", {
    metadata: {
        name: "es-cluster",
        namespace: namespace,
    },
    spec: {
    serviceName: serviceName,
    replicas: 3,
    selector: {
        matchLabels: appLabels,
    },
    template: {
        metadata: {
            labels: {
                app: "elasticsearch",
            },
        },
        spec: {
            containers: [{
                image: "docker.elastic.co/elasticsearch/elasticsearch:7.17.0",
                name: "elasticsearch",
                resources: {
                    limits: {
                        cpu: "1000m",
                    },
                    requests: {
                        cpu: "100m",
                    }
                },
                ports: [
                    {
                        containerPort: appServicePort,
                        name: appServicePortName,
                        protocol: appServicePortProtocol,
                    },
                    {
                        containerPort: appServiceInterNodePort,
                        name: appServiceInterNodePortName,
                        protocol: appServiceInterNodePortProtocol,
                    }
                ],
                volumeMounts: [{
                    mountPath: "/usr/share/elasticsearch/data",
                    name: "data1",
                }],
                env: [
                    {
                        name: "cluster.name",
                        value: "k8s-logs",
                    },
                    {
                        name: "node.name",
                        valueFrom: {
                            fieldRef: {
                                fieldPath: "metadata.name",
                            }
                        }
                    },
                    {
                        name: "discovery.seed_hosts",
                        value: "es-cluster-0.elasticsearch,es-cluster-1.elasticsearch,es-cluster-2.elasticsearch",
                    },
                    {
                        name: "cluster.initial_master_nodes",
                        value: "es-cluster-0,es-cluster-1,es-cluster-2",
                    },
                    {
                        name: "ES_JAVA_OPTS",
                        value: "-Xms512m -Xmx512m",
                    }
                ]
            }],
            initContainers: [
                {
                    name: "fix-permissions",
                    image: "busybox",
                    command: ["sh", "-c", "chown -R 1000:1000 /usr/share/elasticsearch/data"],
                    securityContext: {
                        privileged: true,
                    },
                    volumeMounts: [{
                        mountPath: "/usr/share/elasticsearch/data",
                        name: "data1",
                    }]
                },
                {
                    name: "increase-vm-max-map",
                    image: "busybox",
                    command: ["sysctl", "-w", "vm.max_map_count=262144"],
                    securityContext: {
                        privileged: true,
                    }
                },
                {
                    name: "increase-fd-ulimit",
                    image: "busybox",
                    command: ["sh", "-c", "ulimit -n 65536"],
                    securityContext: {
                        privileged: true,
                    }
                }
            ],
        },
    },
    volumeClaimTemplates: [{
        metadata: {
            name: "data1",
            labels: {
                app: "elasticsearch",
            }
        },
        spec: {
            accessModes: ["ReadWriteOnce"],
            resources: {
                requests: {
                    storage: "6Gi",
                },
            },
        },
    }],
}});

const appService = new k8s.core.v1.Service("elasticsearch", {
    metadata: { namespace: namespace, labels: appLabels, name: serviceName },
    spec: {
        selector: appLabels,
        clusterIP: "None",
        ports: [
            {
                port: appServicePort,
                name: appServicePortName,
                protocol: appServicePortProtocol,
            },
            {
                port: appServiceInterNodePort,
                name: appServiceInterNodePortName,
                protocol: appServiceInterNodePortProtocol,
            }
        ],
    }
});

export const name = "elasticsearch";
