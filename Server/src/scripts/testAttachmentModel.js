require('dotenv').config();
const { Attachment } = require('../models');
const { sequelize } = require('../config/database');

const testAttachmentModel = async () => {
  try {
    console.log('=== Testing Attachment Model ===\n');
    
    // Test basic query
    console.log('Testing Attachment.count()...');
    const count = await Attachment.count();
    console.log(`Attachment count: ${count}`);
    
    // Test sum query
    console.log('Testing Attachment.sum()...');
    const totalSize = await Attachment.sum('fileSize') || 0;
    console.log(`Total storage: ${totalSize} bytes`);
    
    // Test findAll query
    console.log('Testing Attachment.findAll()...');
    const attachments = await Attachment.findAll({
      attributes: ['id', 'fileName', 'fileSize'],
      limit: 5
    });
    
    console.log(`Found ${attachments.length} attachments:`);
    attachments.forEach(att => {
      console.log(`  - ${att.fileName} (${att.fileSize} bytes)`);
    });
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Error testing Attachment model:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

testAttachmentModel();
