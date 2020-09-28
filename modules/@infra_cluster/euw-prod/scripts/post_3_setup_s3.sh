#! /bin/bash

aws s3api create-bucket --bucket ticket721 --region eu-west-3 --create-bucket-configuration LocationConstraint=eu-west-3 --
aws s3api put-bucket-tagging --bucket ticket721 --tagging '{
  "TagSet": [
    {
      "Key": "cluster",
      "Value": "euw"
    }
  ]
}'
aws s3api put-bucket-policy --bucket ticket721 --policy '{
         "Version": "2008-10-17",
         "Statement": [
             {
                 "Sid": "AllowPublicRead",
                 "Effect": "Allow",
                 "Principal": {
                     "AWS": "*"
                 },
                 "Action": "s3:GetObject",
                 "Resource": "arn:aws:s3:::ticket721/public/*"
             }
         ]
     }';
aws s3api put-object --bucket ticket721 --key public/


