#! /bin/bash

EXISTING_FS_CHECK=$(aws efs describe-file-systems --output json | jq '.FileSystems[] | select(.Tags[].Key=="Cluster" and .Tags[].Value=="euw")' | jq '.FileSystemId')

if [ "$EXISTING_FS_CHECK" = "" ]
then

  CLUSTER_NAME=euw
  VPC_ID=$(aws eks describe-cluster --name $CLUSTER_NAME --query "cluster.resourcesVpcConfig.vpcId" --output text)
  CIDR_BLOCK=$(aws ec2 describe-vpcs --vpc-ids $VPC_ID --query "Vpcs[].CidrBlock" --output text)

  MOUNT_TARGET_GROUP_NAME="eks-euw-efs"
  MOUNT_TARGET_GROUP_DESC="NFS access to EFS from EKS worker nodes"
  MOUNT_TARGET_GROUP_ID=$(aws ec2 create-security-group --group-name $MOUNT_TARGET_GROUP_NAME --description "$MOUNT_TARGET_GROUP_DESC" --vpc-id $VPC_ID | jq --raw-output '.GroupId')
  aws ec2 authorize-security-group-ingress --group-id $MOUNT_TARGET_GROUP_ID --protocol tcp --port 2049 --cidr $CIDR_BLOCK

  FILE_SYSTEM_ID=$(aws efs create-file-system --tags "Key=Cluster,Value=euw" | jq --raw-output '.FileSystemId')

  STATE=$(aws efs describe-file-systems --file-system-id $FILE_SYSTEM_ID | jq --raw-output '.FileSystems[0].LifeCycleState')
  while [ "$STATE" = "creating" ]
  do
    sleep 1
    echo 'creating ...'
    STATE=$(aws efs describe-file-systems --file-system-id $FILE_SYSTEM_ID | jq --raw-output '.FileSystems[0].LifeCycleState')
  done

  TAG1=tag:kubernetes.io/cluster/$CLUSTER_NAME
  TAG2=tag:kubernetes.io/role/elb
  subnets=$(aws ec2 describe-subnets --filters "Name=$TAG1,Values=shared" "Name=$TAG2,Values=1" | jq --raw-output '.Subnets[].SubnetId')
  for subnet in ${subnets[@]}
  do
      echo "creating mount target in " $subnet
      aws efs create-mount-target --file-system-id $FILE_SYSTEM_ID --subnet-id $subnet --security-groups $MOUNT_TARGET_GROUP_ID
  done

  COUNT=0
  while [ $COUNT -ne 3 ]
  do
    COUNT=0
    STATES=$(aws efs describe-mount-targets --file-system-id $FILE_SYSTEM_ID | jq --raw-output '.MountTargets[].LifeCycleState')

    for state in ${STATES[@]}
    do

    if [ $state = "available" ]
    then
      echo -e "+\c"
      COUNT=$((COUNT+1))
    else
      echo -e "-\c"
    fi

    done

    echo

  done


else

  echo "EFS Already Exists"

fi

